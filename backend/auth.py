import os
from datetime import datetime, timedelta, timezone
from pathlib import Path

import jwt

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

from dotenv import load_dotenv

import mysql.connector
from mysql.connector import Error


# ============================================================
# LOAD .ENV FROM PROJECT ROOT
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

ENV_FILE = BASE_DIR / ".env"

load_dotenv(
    dotenv_path=ENV_FILE
)


# ============================================================
# JWT CONFIGURATION
# ============================================================

JWT_SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY"
)

JWT_ALGORITHM = "HS256"

JWT_EXPIRATION_HOURS = 24


password_hasher = PasswordHasher()


# ============================================================
# DATABASE CONNECTION
# ============================================================

def get_db_connection():

    return mysql.connector.connect(

        host=os.getenv(
            "MYSQL_HOST",
            "localhost"
        ),

        port=int(
            os.getenv(
                "MYSQL_PORT",
                "3306"
            )
        ),

        user=os.getenv(
            "MYSQL_USER",
            "root"
        ),

        password=os.getenv(
            "MYSQL_PASSWORD",
            ""
        ),

        database=os.getenv(
            "MYSQL_DATABASE",
            "study_mentor"
        )
    )


# ============================================================
# PASSWORD HASHING
# ============================================================

def hash_password(password):

    return password_hasher.hash(
        password
    )


def verify_password(
    password,
    password_hash
):

    try:

        return password_hasher.verify(
            password_hash,
            password
        )

    except VerifyMismatchError:

        return False

    except Exception as error:

        print(
            "Password verification error:",
            error
        )

        return False


# ============================================================
# CREATE USER
# ============================================================

def create_user(
    username,
    password
):

    username = username.strip()


    if not username:

        return None, "Username cannot be empty."


    if len(username) < 3:

        return None, (
            "Username must contain at least 3 characters."
        )


    if len(username) > 100:

        return None, "Username is too long."


    if not password:

        return None, "Password cannot be empty."


    if len(password) < 8:

        return None, (
            "Password must contain at least 8 characters."
        )


    connection = None
    cursor = None


    try:

        connection = get_db_connection()

        cursor = connection.cursor()


        # ----------------------------------------------------
        # Check existing username
        # ----------------------------------------------------

        cursor.execute(

            """
            SELECT id
            FROM users
            WHERE username = %s
            """,

            (username,)

        )


        existing_user = cursor.fetchone()


        if existing_user:

            return None, "Username already exists."


        # ----------------------------------------------------
        # Hash password
        # ----------------------------------------------------

        password_hash = hash_password(
            password
        )


        # ----------------------------------------------------
        # Insert user
        # ----------------------------------------------------

        cursor.execute(

            """
            INSERT INTO users
            (username, password_hash)
            VALUES (%s, %s)
            """,

            (
                username,
                password_hash
            )

        )


        user_id = cursor.lastrowid


        # ----------------------------------------------------
        # Create empty student profile
        # ----------------------------------------------------

        cursor.execute(

            """
            INSERT INTO student_profiles
            (user_id)
            VALUES (%s)
            """,

            (user_id,)

        )


        connection.commit()


        return {

            "id": user_id,

            "username": username

        }, None


    except Error as error:

        print(
            "Database error while creating user:",
            error
        )


        if connection:

            connection.rollback()


        return None, (
            "Database error while creating account."
        )


    finally:

        if cursor:

            cursor.close()


        if connection:

            connection.close()


# ============================================================
# GET USER
# ============================================================

def get_user_by_username(
    username
):

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
                id,
                username,
                password_hash,
                created_at
            FROM users
            WHERE username = %s
            """,

            (username,)

        )


        return cursor.fetchone()


    except Error as error:

        print(
            "Database error while finding user:",
            error
        )

        return None


    finally:

        if cursor:

            cursor.close()


        if connection:

            connection.close()


# ============================================================
# AUTHENTICATE USER
# ============================================================

def authenticate_user(
    username,
    password
):

    username = username.strip()


    user = get_user_by_username(
        username
    )


    if not user:

        return None


    valid_password = verify_password(

        password,

        user["password_hash"]

    )


    if not valid_password:

        return None


    return user


# ============================================================
# CREATE JWT TOKEN
# ============================================================

def create_access_token(
    user
):

    if not JWT_SECRET_KEY:

        raise RuntimeError(
            "JWT_SECRET_KEY is missing from the .env file."
        )


    expiration = (

        datetime.now(timezone.utc)

        + timedelta(
            hours=JWT_EXPIRATION_HOURS
        )

    )


    payload = {

        "sub": str(
            user["id"]
        ),

        "username": user["username"],

        "exp": expiration

    }


    token = jwt.encode(

        payload,

        JWT_SECRET_KEY,

        algorithm=JWT_ALGORITHM

    )


    return token


# ============================================================
# VERIFY JWT TOKEN
# ============================================================

def verify_token(
    token
):

    if not JWT_SECRET_KEY:

        print(
            "JWT_SECRET_KEY is missing."
        )

        return None


    try:

        payload = jwt.decode(

            token,

            JWT_SECRET_KEY,

            algorithms=[
                JWT_ALGORITHM
            ]

        )


        return payload


    except jwt.ExpiredSignatureError:

        return None


    except jwt.InvalidTokenError:

        return None


    except Exception as error:

        print(
            "Token verification error:",
            error
        )

        return None