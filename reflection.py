from groq import Groq
from config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY)

def generate_reflection(user_message):

    prompt = f"""
Extract only important long-term information.

Store ONLY if it contains:
- learning preferences
- weak subjects
- goals
- exam information
- personal preferences

If nothing important exists, return:

NONE

Message:
{user_message}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response.choices[0].message.content.strip()