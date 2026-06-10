from groq import Groq
from config import GROQ_API_KEY
from memory import recall_memory

client = Groq(api_key=GROQ_API_KEY)

def ask_agent(user_message):

    memories = recall_memory(user_message)

    memory_context = "\n".join(memories)

    prompt = f"""
You are a Study Mentor AI.

Relevant memories:
{memory_context}

Current Question:
{user_message}

Use the memories when helpful.
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

    return response.choices[0].message.content