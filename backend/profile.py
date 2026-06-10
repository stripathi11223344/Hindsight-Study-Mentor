from hindsight_client import Hindsight
from dotenv import load_dotenv
import os

load_dotenv()

client = Hindsight(
    base_url="https://api.hindsight.vectorize.io",
    api_key=os.getenv("HINDSIGHT_API_KEY")
)

BANK_ID = "study-mentor"

def create_user_profile():

    result = client.create_mental_model(
        bank_id=BANK_ID,
        name="Student Profile",
        source_query="What do we know about this student?"
    )

    return result