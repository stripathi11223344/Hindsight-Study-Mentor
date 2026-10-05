from hindsight_client import Hindsight
from dotenv import load_dotenv

import os
import hashlib
import re
from difflib import SequenceMatcher


load_dotenv()


# ============================================================
# HINDSIGHT CLIENT
# ============================================================

client = Hindsight(
    base_url="https://api.hindsight.vectorize.io",
    api_key=os.getenv("HINDSIGHT_API_KEY")
)


# ============================================================
# TEMPORARY DUPLICATE CACHE
# ============================================================

saved_memory_hashes = set()


# ============================================================
# CLEAN MEMORY
# ============================================================

def clean_memory(text):

    if not text:
        return ""

    text = text.strip()

    # Remove Hindsight display metadata
    text = re.sub(
        r"\s*\|\s*Involving\s*:\s*.*$",
        "",
        text,
        flags=re.IGNORECASE
    )

    text = re.sub(
        r"\s*\|\s*When\s*:\s*.*$",
        "",
        text,
        flags=re.IGNORECASE
    )

    # Remove accidental "Memory:" prefix
    text = re.sub(
        r"^\s*memory\s*:\s*",
        "",
        text,
        flags=re.IGNORECASE
    )

    # Convert:
    # The user is...
    # into:
    # User is...
    text = re.sub(
        r"^\s*the\s+user\b",
        "User",
        text,
        flags=re.IGNORECASE
    )

    # Remove extra spaces
    text = " ".join(
        text.split()
    )

    return text.strip()


# ============================================================
# NORMALIZE MEMORY
# ============================================================

def normalize_memory(text):

    text = clean_memory(text)

    if not text:
        return ""

    text = text.lower()

    # Treat "the user" and "user" as identical
    text = re.sub(
        r"\bthe\s+user\b",
        "user",
        text
    )

    # Remove punctuation
    text = re.sub(
        r"[^a-z0-9\s]",
        "",
        text
    )

    # Normalize spaces
    text = " ".join(
        text.split()
    )

    return text.strip()


# ============================================================
# MEMORY HASH
# ============================================================

def get_memory_hash(text):

    normalized = normalize_memory(text)

    return hashlib.sha256(
        normalized.encode("utf-8")
    ).hexdigest()


# ============================================================
# SIMILARITY CHECK
# ============================================================

def memories_are_similar(memory1, memory2):

    normalized1 = normalize_memory(memory1)
    normalized2 = normalize_memory(memory2)

    if not normalized1 or not normalized2:
        return False

    # Exact normalized match
    if normalized1 == normalized2:
        return True

    # Similarity check
    similarity = SequenceMatcher(
        None,
        normalized1,
        normalized2
    ).ratio()

    return similarity >= 0.92


# ============================================================
# BANK ID
# ============================================================

def get_bank_id(username):

    return f"user_{username.lower().strip()}"


# ============================================================
# CREATE BANK
# ============================================================

def create_bank(username):

    bank_id = get_bank_id(username)

    try:

        client.create_bank(
            bank_id=bank_id,
            name=username
        )

        print()
        print(
            "BANK CREATED:",
            bank_id
        )
        print()

    except Exception as error:

        # Bank probably already exists
        print(
            "Bank already exists:",
            bank_id
        )


# ============================================================
# SAVE MEMORY
# ============================================================

def save_memory(text, username):

    print()
    print("-" * 60)
    print("SAVE MEMORY")
    print("-" * 60)

    print(
        "USERNAME:",
        username
    )

    print(
        "RAW MEMORY:",
        text
    )

    # --------------------------------------------------------
    # Validate
    # --------------------------------------------------------

    if not text:

        print(
            "Memory empty. Nothing saved."
        )

        return False

    # --------------------------------------------------------
    # Clean
    # --------------------------------------------------------

    text = clean_memory(text)

    print(
        "CLEAN MEMORY:",
        text
    )

    if not text:

        print(
            "Clean memory empty."
        )

        return False

    # --------------------------------------------------------
    # Ignore NONE
    # --------------------------------------------------------

    if text.upper() == "NONE":

        print(
            "Reflection returned NONE."
        )

        return False

    # --------------------------------------------------------
    # Only allow memories about the student
    # --------------------------------------------------------

    if not text.lower().startswith("user "):

        print(
            "Memory rejected because it does not start with 'User'."
        )

        return False

    # --------------------------------------------------------
    # Hash
    # --------------------------------------------------------

    memory_hash = get_memory_hash(text)

    # --------------------------------------------------------
    # Current-session duplicate protection
    # --------------------------------------------------------

    if memory_hash in saved_memory_hashes:

        print(
            "DUPLICATE MEMORY BLOCKED."
        )

        return False

    # --------------------------------------------------------
    # SAVE TO HINDSIGHT
    # --------------------------------------------------------

    try:

        bank_id = get_bank_id(username)

        print(
            "BANK:",
            bank_id
        )

        print(
            "Saving to Hindsight..."
        )

        result = client.retain(
            bank_id=bank_id,
            content=text
        )

        saved_memory_hashes.add(
            memory_hash
        )

        print(
            "MEMORY SAVED SUCCESSFULLY."
        )

        print(
            "HINDSIGHT RESULT:",
            result
        )

        print("-" * 60)
        print()

        return True

    except Exception as error:

        print(
            "MEMORY SAVE ERROR:",
            repr(error)
        )

        print("-" * 60)
        print()

        return False


# ============================================================
# RECALL MEMORY
# ============================================================

def recall_memory(query, username):

    print()
    print("-" * 60)
    print("RECALL MEMORY")
    print("-" * 60)

    print(
        "USERNAME:",
        username
    )

    print(
        "QUERY:",
        query
    )

    try:

        bank_id = get_bank_id(username)

        print(
            "BANK:",
            bank_id
        )

        # ----------------------------------------------------
        # IMPORTANT:
        # Use the basic recall API for compatibility.
        # ----------------------------------------------------

        result = client.recall(
            bank_id=bank_id,
            query=query
        )

        print(
            "RAW HINDSIGHT RESULTS:",
            len(result.results)
        )

        memories = []

        # ----------------------------------------------------
        # Bad memory patterns
        # ----------------------------------------------------

        blocked_phrases = [

            "der benutzer",

            "benutzer erkundigt",

            "benutzer fragt",

            "benutzer möchte wissen",

            "the user asks",

            "the user is asking",

            "the user wants to know",

            "user asks",

            "user is asking",

            "user wants to know",

            "the student asks",

            "the student is asking",

            "student asks",

            "student is asking"
        ]

        # ----------------------------------------------------
        # Process results
        # ----------------------------------------------------

        for item in result.results:

            if not item.text:
                continue

            memory = clean_memory(
                item.text
            )

            if not memory:
                continue

            lower_memory = memory.lower()

            # ------------------------------------------------
            # Block old/bad memories
            # ------------------------------------------------

            blocked = False

            for phrase in blocked_phrases:

                if phrase in lower_memory:

                    blocked = True
                    break

            if blocked:

                print(
                    "BLOCKED MEMORY:",
                    memory
                )

                continue

            # ------------------------------------------------
            # Only actual student memories
            # ------------------------------------------------

            if not lower_memory.startswith("user "):

                print(
                    "NON-USER MEMORY BLOCKED:",
                    memory
                )

                continue

            # ------------------------------------------------
            # Duplicate check
            # ------------------------------------------------

            duplicate = False

            for existing in memories:

                if memories_are_similar(
                    memory,
                    existing
                ):

                    duplicate = True

                    print(
                        "DUPLICATE RECALL BLOCKED:",
                        memory
                    )

                    break

            if duplicate:
                continue

            # ------------------------------------------------
            # Add memory
            # ------------------------------------------------

            memories.append(
                memory
            )

        print(
            "CLEAN MEMORIES:",
            memories
        )

        print("-" * 60)
        print()

        return memories

    except Exception as error:

        print(
            "MEMORY RECALL ERROR:",
            repr(error)
        )

        print("-" * 60)
        print()

        return []