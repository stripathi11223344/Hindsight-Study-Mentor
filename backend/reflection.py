from groq import Groq
from config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY)

def generate_reflection(user_message):

    prompt = f"""
Extract ONLY important long-term facts about the USER.

Store information such as:
- Weak subjects
- Strong subjects
- Learning preferences
- Goals
- Exam plans
- Study habits

Rules:
- Write only one short memory.
- Write in English.
- Focus on the USER, not the AI.
- Do not mention AI agents.
- Do not mention names.
- Do not mention yourself.

Examples:

User: I am weak in Statistics
Memory: User is weak in Statistics.

User: I learn best through examples
Memory: User learns best through examples.

User: My exam is next month
Memory: User has an exam next month.

If nothing important exists return:

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