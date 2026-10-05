from groq import Groq
from config import GROQ_API_KEY


client = Groq(
    api_key=GROQ_API_KEY
)


def generate_reflection(user_message):

    prompt = f"""
You are the long-term memory extraction component
of a personalized AI Study Mentor.

Your job is to decide whether the student's message
contains useful information that should be remembered
for future conversations.

==================================================
STORE ONLY LONG-TERM STUDENT FACTS
==================================================

Store information such as:

- Weak subjects
- Strong subjects
- Learning preferences
- Preferred explanation style
- Study habits
- Academic goals
- Career goals
- Exam goals
- Placement goals
- Long-term projects
- Programming languages the student is learning
- Technologies the student knows
- Persistent difficulties
- Important learning preferences

Examples:

Student:
"I am very weak in Statistics, especially probability."

Return:
User is weak in Statistics, especially probability.

Student:
"I prefer learning Java through practical coding examples."

Return:
User prefers learning Java through practical coding examples.

Student:
"I am preparing for placements."

Return:
User is preparing for placement opportunities.

Student:
"I know Python and C++ but I am currently learning Java."

Return:
User knows Python and C++ and is currently learning Java.

==================================================
DO NOT STORE
==================================================

Return NONE for:

- Normal questions
- Questions about academic concepts
- Temporary calculations
- One-time homework questions
- Requests for explanations
- Greetings
- Thanks
- Casual conversation
- Questions about the AI
- Questions about Hindsight
- Questions about memory
- Requests to solve coding problems
- Temporary debugging information
- Information that is only relevant to the current question
- Statements that do not describe the student
- General facts about the world
- Facts about other people
- Hypothetical statements
- Questions such as "What is probability?"
- Questions such as "Explain Java"
- Questions such as "What is DSA?"
- Questions such as "How does Python work?"

==================================================
IMPORTANT QUALITY RULE
==================================================

The memory must describe something about THE STUDENT.

Bad:

User asks about probability.

User wants to know about statistics.

User is asking a question about Java.

User is interested in an academic subject.

These are NOT useful memories.

Return NONE for them.

A memory must contain a concrete and reusable
student fact.

==================================================
LANGUAGE RULE
==================================================

Always return the memory in simple English.

Never return German.

Never return Hindi unless the student's actual
long-term preference is specifically being stored.

Never translate the student's question into
a memory.

==================================================
FORMAT
==================================================

Return exactly ONE of:

1. A single concise English memory beginning with:

User ...

OR

2. NONE

Do not return explanations.

Do not return "Memory:".

Do not return JSON.

Do not return bullet points.

Do not return multiple memories.

==================================================
STUDENT MESSAGE
==================================================

{user_message}

==================================================

Return ONLY the memory or NONE.
"""

    try:

        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",

            messages=[
                {
                    "role": "system",
                    "content": prompt
                }
            ],

            temperature=0.0,

            max_tokens=100
        )

        result = response.choices[0].message.content

        if not result:
            return "NONE"

        result = result.strip()


        # ----------------------------------------------
        # Basic cleanup
        # ----------------------------------------------

        if result.upper() == "NONE":
            return "NONE"


        if result.lower().startswith("memory:"):

            result = result[
                len("memory:"):
            ].strip()


        # ----------------------------------------------
        # Reject suspicious output
        # ----------------------------------------------

        forbidden_phrases = [

            "the user asks",

            "the user is asking",

            "the user wants to know",

            "user asks",

            "user is asking",

            "user wants to know",

            "user is interested in",

            "der benutzer",

            "benutzer erkundigt",

            "the student asks",

            "the student is asking",

            "student asks",

            "student is asking"
        ]


        lower_result =result.lower()


        for phrase in forbidden_phrases:

            if phrase in lower_result:

                print(
                    "Rejected memory:",
                    result
                )

                return "NONE"


        # ----------------------------------------------
        # Must describe the student
        # ----------------------------------------------

        if not lower_result.startswith("user "):

            print(
                "Rejected non-user memory:",
                result
            )

            return "NONE"


        # ----------------------------------------------
        # Reject very short / suspicious memories
        # ----------------------------------------------

        if len(result) < 15:

            return "NONE"


        return result


    except Exception as error:

        print(
            "Reflection error:",
            error
        )

        return "NONE"