from hindsight_client import Hindsight
from dotenv import load_dotenv
import os

load_dotenv()

client = Hindsight(
    base_url="https://api.hindsight.vectorize.io",
    api_key=os.getenv("HINDSIGHT_API_KEY")
)

BANK_ID = "study-mentor"

def create_bank():
    try:
        client.create_bank(
            bank_id=BANK_ID,
            name="Study Mentor"
        )
        print("Bank created")
    except:
        print("Bank already exists")

def save_memory(text):
    client.retain(
        bank_id=BANK_ID,
        content=text
    )

def recall_memory(query):
    result = client.recall(
        bank_id=BANK_ID,
        query=query
    )

    memories = []

    for item in result.results:
        memories.append(item.text)

    return memories