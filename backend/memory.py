from hindsight_client import Hindsight
from dotenv import load_dotenv
import os

load_dotenv()

client = Hindsight(
    base_url="https://api.hindsight.vectorize.io",
    api_key=os.getenv("HINDSIGHT_API_KEY")
)

def get_bank_id(username):
    return f"user_{username.lower()}"

def create_bank(username):
    try:
        client.create_bank(
            bank_id=get_bank_id(username),
            name=username
        )
        print("Bank created")
    except:
        print("Bank already exists")

def save_memory(text, username):
    client.retain(
        bank_id=get_bank_id(username),
        content=text
    )

def recall_memory(query, username):
    result = client.recall(
        bank_id=get_bank_id(username),
        query=query
    )

    memories = []

    for item in result.results:
        memories.append(item.text)

    return memories