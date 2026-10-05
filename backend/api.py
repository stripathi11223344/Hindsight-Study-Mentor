import os
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agent import ask_agent
from reflection import generate_reflection
from memory import save_memory, recall_memory
from auth import (
    create_user,
    authenticate_user,
    create_access_token,
    verify_token,
    get_user_by_username,
    get_db_connection
)

from mysql.connector import Error


# ==========================================================
# FASTAPI APP
# ==========================================================

app = FastAPI()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# your other imports...


app = FastAPI()


# ==================================================
# CORS CONFIGURATION
# ==================================================

LOCAL_ORIGINS = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
]

PRODUCTION_FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "https://6a296c43af246227ec63b332--bespoke-marzipan-0864be.netlify.app"
)

ALLOWED_ORIGINS = LOCAL_ORIGINS.copy()

if PRODUCTION_FRONTEND_URL:
    ALLOWED_ORIGINS.append(
        PRODUCTION_FRONTEND_URL.rstrip("/")
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# your existing routes...


# ==========================================================
# REQUEST MODELS
# ==========================================================

class ChatRequest(BaseModel):
    message: str


class AuthRequest(BaseModel):
    username: str
    password: str


class ProfileRequest(BaseModel):
    weak_subjects: str | None = None
    strong_subjects: str | None = None
    learning_style: str | None = None
    goals: str | None = None
    career_goal: str | None = None
    programming_skills: str | None = None
    current_learning: str | None = None
    persistent_difficulties: str | None = None


# ==========================================================
# AUTHENTICATION HELPER
# ==========================================================

def get_authenticated_user(
    authorization: str | None
):
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization header is required."
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization format."
        )

    token = authorization.replace(
        "Bearer ",
        "",
        1
    ).strip()

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Token is missing."
        )

    payload = verify_token(token)

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token."
        )

    return payload


# ==========================================================
# LEARNING ACTIVITY TRACKING
# ==========================================================

def record_learning_activity(
    user_id,
    activity_type,
    subject=None,
    topic=None,
    details=None
):
    """
    Save one learning event into MySQL.

    This function is intentionally separate from the
    AI response generation so that a database failure
    does not break the user's chat.
    """

    connection = None
    cursor = None

    try:
        connection = get_db_connection()

        cursor = connection.cursor()

        query = """
            INSERT INTO learning_activity
            (
                user_id,
                activity_type,
                subject,
                topic,
                details
            )
            VALUES
            (
                %s,
                %s,
                %s,
                %s,
                %s
            )
        """

        cursor.execute(
            query,
            (
                user_id,
                activity_type,
                subject,
                topic,
                details
            )
        )

        connection.commit()

        print(
            "LEARNING ACTIVITY SAVED:",
            activity_type,
            subject,
            topic
        )

        return True

    except Error as error:

        print(
            "LEARNING ACTIVITY ERROR:",
            repr(error)
        )

        return False

    except Exception as error:

        print(
            "LEARNING ACTIVITY UNEXPECTED ERROR:",
            repr(error)
        )

        return False

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ==========================================================
# GET USER ID
# ==========================================================

def get_authenticated_user_id(
    authorization: str | None
):
    user = get_authenticated_user(
        authorization
    )

    user_id = user.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="User ID not found in token."
        )

    return int(user_id)


# ==========================================================
# ROOT
# ==========================================================

@app.get("/")
def home():

    return {
        "message": "Study Mentor AI backend is running."
    }


# ==========================================================
# REGISTER
# ==========================================================

@app.post("/register")
def register(
    request: AuthRequest
):

    user, error = create_user(
        request.username,
        request.password
    )

    if error:
        raise HTTPException(
            status_code=400,
            detail=error
        )

    token = create_access_token(
        user
    )

    return {
        "success": True,
        "message": "Account created successfully.",
        "token": token,
        "username": user["username"],
        "user_id": user["id"]
    }


# ==========================================================
# LOGIN
# ==========================================================

@app.post("/login")
def login(
    request: AuthRequest
):

    user = authenticate_user(
        request.username,
        request.password
    )

    if not user:

        raise HTTPException(
            status_code=401,
            detail="Invalid username or password."
        )

    token = create_access_token(
        user
    )

    return {
        "success": True,
        "message": "Login successful.",
        "token": token,
        "username": user["username"],
        "user_id": user["id"]
    }


# ==========================================================
# VERIFY TOKEN
# ==========================================================

@app.get("/verify-token")
def verify_user_token(
    authorization: str | None = Header(default=None)
):

    user = get_authenticated_user(
        authorization
    )

    return {
        "success": True,
        "valid": True,
        "user": user
    }


# ==========================================================
# CHAT
# ==========================================================

@app.post("/chat")
def chat(
    request: ChatRequest,
    authorization: str | None = Header(default=None)
):

    user = get_authenticated_user(
        authorization
    )

    username = user.get("username")
    user_id = int(user.get("sub"))

    if not username:

        raise HTTPException(
            status_code=401,
            detail="Username not found."
        )

    message = request.message.strip()

    if not message:

        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty."
        )

    try:

        # --------------------------------------------------
        # ASK AI
        # --------------------------------------------------

        response = ask_agent(
            message,
            username
        )

        # --------------------------------------------------
        # LEARNING ACTIVITY
        # --------------------------------------------------
        #
        # At this stage we record the complete question.
        # Subject/topic classification will be connected
        # to the AI response in the next progress stage.
        #
        # This gives us reliable real user activity first.
        # --------------------------------------------------

        record_learning_activity(
            user_id=user_id,
            activity_type="question",
            subject=None,
            topic=None,
            details=message
        )

        # --------------------------------------------------
        # REFLECTION
        # --------------------------------------------------

        memory = generate_reflection(
            message,
        
        )

        print(
            "REFLECTION:",
            memory
        )

        # --------------------------------------------------
        # SAVE LONG-TERM MEMORY
        # --------------------------------------------------

        if memory:

            save_memory(
                memory,
                username
            )

        # --------------------------------------------------
        # RETURN RESPONSE
        # --------------------------------------------------

        return {
            "success": True,
            "response": response
        }

    except HTTPException:

        raise

    except Exception as error:

        print(
            "CHAT ERROR:",
            repr(error)
        )

        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing your question."
        )


# ==========================================================
# MEMORIES
# ==========================================================

@app.post("/memories")
def memories(
    authorization: str | None = Header(default=None)
):

    user = get_authenticated_user(
        authorization
    )

    username = user.get("username")

    if not username:

        raise HTTPException(
            status_code=401,
            detail="Username not found."
        )

    try:

        memory_list = recall_memory(
            "important long-term facts about the student",
            username
        )

        return {
            "success": True,
            "memories": memory_list
        }

    except Exception as error:

        print(
            "MEMORIES ERROR:",
            repr(error)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to load memories."
        )


# ==========================================================
# GET PROFILE
# ==========================================================

@app.get("/profile")
def get_profile(
    authorization: str | None = Header(default=None)
):

    user_id = get_authenticated_user_id(
        authorization
    )

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )

        cursor.execute(
            """
            SELECT
                weak_subjects,
                strong_subjects,
                learning_style,
                goals,
                career_goal,
                programming_skills,
                current_learning,
                persistent_difficulties
            FROM student_profiles
            WHERE user_id = %s
            """,
            (user_id,)
        )

        profile = cursor.fetchone()

        if not profile:

            return {
                "success": True,
                "profile": None
            }

        return {
            "success": True,
            "profile": profile
        }

    except Error as error:

        print(
            "PROFILE GET ERROR:",
            repr(error)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to load profile."
        )

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ==========================================================
# CREATE PROFILE
# ==========================================================

@app.post("/profile")
def create_profile(
    request: ProfileRequest,
    authorization: str | None = Header(default=None)
):

    user_id = get_authenticated_user_id(
        authorization
    )

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT INTO student_profiles
            (
                user_id,
                weak_subjects,
                strong_subjects,
                learning_style,
                goals,
                career_goal,
                programming_skills,
                current_learning,
                persistent_difficulties
            )
            VALUES
            (
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s
            )
            """,
            (
                user_id,
                request.weak_subjects,
                request.strong_subjects,
                request.learning_style,
                request.goals,
                request.career_goal,
                request.programming_skills,
                request.current_learning,
                request.persistent_difficulties
            )
        )

        connection.commit()

        return {
            "success": True,
            "message": "Profile created successfully."
        }

    except Error as error:

        if connection:
            connection.rollback()

        print(
            "PROFILE CREATE ERROR:",
            repr(error)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to create profile."
        )

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ==========================================================
# UPDATE PROFILE
# ==========================================================

@app.put("/profile")
def update_profile(
    request: ProfileRequest,
    authorization: str | None = Header(default=None)
):

    user_id = get_authenticated_user_id(
        authorization
    )

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor()

        cursor.execute(
            """
            UPDATE student_profiles
            SET
                weak_subjects = %s,
                strong_subjects = %s,
                learning_style = %s,
                goals = %s,
                career_goal = %s,
                programming_skills = %s,
                current_learning = %s,
                persistent_difficulties = %s
            WHERE user_id = %s
            """,
            (
                request.weak_subjects,
                request.strong_subjects,
                request.learning_style,
                request.goals,
                request.career_goal,
                request.programming_skills,
                request.current_learning,
                request.persistent_difficulties,
                user_id
            )
        )

        connection.commit()

        return {
            "success": True,
            "message": "Profile updated successfully."
        }

    except Error as error:

        if connection:
            connection.rollback()

        print(
            "PROFILE UPDATE ERROR:",
            repr(error)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to update profile."
        )

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ==========================================================
# DASHBOARD
# ==========================================================

@app.get("/dashboard")
def dashboard(
    authorization: str | None = Header(default=None)
):

    user = get_authenticated_user(
        authorization
    )

    username = user.get("username")
    user_id = int(user.get("sub"))

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )

        # --------------------------------------------------
        # USER
        # --------------------------------------------------

        cursor.execute(
            """
            SELECT
                id,
                username,
                created_at
            FROM users
            WHERE id = %s
            """,
            (user_id,)
        )

        user_data = cursor.fetchone()

        # --------------------------------------------------
        # PROFILE
        # --------------------------------------------------

        cursor.execute(
            """
            SELECT
                weak_subjects,
                strong_subjects,
                learning_style,
                goals,
                career_goal,
                programming_skills,
                current_learning,
                persistent_difficulties
            FROM student_profiles
            WHERE user_id = %s
            """,
            (user_id,)
        )

        profile = cursor.fetchone()

        # --------------------------------------------------
        # LONG-TERM MEMORIES
        # --------------------------------------------------

        memories = recall_memory(
            "important long-term facts about the student",
            username
        )

        # --------------------------------------------------
        # LEARNING ACTIVITY
        # --------------------------------------------------

        cursor.execute(
            """
            SELECT
                id,
                activity_type,
                subject,
                topic,
                details,
                created_at
            FROM learning_activity
            WHERE user_id = %s
            ORDER BY created_at DESC
            LIMIT 20
            """,
            (user_id,)
        )

        activities = cursor.fetchall()

        # --------------------------------------------------
        # TOTAL ACTIVITY COUNT
        # --------------------------------------------------

        cursor.execute(
            """
            SELECT COUNT(*) AS total
            FROM learning_activity
            WHERE user_id = %s
            """,
            (user_id,)
        )

        activity_count_result = cursor.fetchone()

        activity_count = (
            activity_count_result["total"]
            if activity_count_result
            else 0
        )

        # --------------------------------------------------
        # SUBJECT COUNTS
        # --------------------------------------------------

        cursor.execute(
            """
            SELECT
                subject,
                COUNT(*) AS activity_count
            FROM learning_activity
            WHERE
                user_id = %s
                AND subject IS NOT NULL
                AND subject != ''
            GROUP BY subject
            ORDER BY activity_count DESC
            """,
            (user_id,)
        )

        subject_counts = cursor.fetchall()

        return {
            "success": True,

            "user": {
                "id": user_data["id"]
                if user_data
                else user_id,

                "username": user_data["username"]
                if user_data
                else username,

                "created_at": user_data["created_at"]
                if user_data
                else None
            },

            "profile": profile,

            "memory_count": len(memories),

            "memories": memories,

            "learning_activity_count":
                activity_count,

            "recent_activity":
                activities,

            "subject_counts":
                subject_counts,

            "progress": {
                "available": True,
                "message":
                    "Learning activity tracking is active."
            }
        }

    except Error as error:

        print(
            "DASHBOARD DATABASE ERROR:",
            repr(error)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to load dashboard data."
        )

    except Exception as error:

        print(
            "DASHBOARD ERROR:",
            repr(error)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to load dashboard data."
        )

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()