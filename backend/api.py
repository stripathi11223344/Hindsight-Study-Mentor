from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agent import ask_agent
from memory import (
    create_bank,
    recall_memory,
    save_memory
)
from reflection import generate_reflection

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    username: str
    message: str

class MemoryRequest(BaseModel):
    username: str

@app.get("/")
def home():
    return {"message": "Study Mentor API Running"}

@app.post("/chat")
def chat(request: ChatRequest):

    create_bank(request.username)

    response = ask_agent(
        request.message,
        request.username
    )

    reflection = generate_reflection(
        request.message
    )

    print("REFLECTION:", reflection)

    if reflection != "NONE":

        existing_memories = recall_memory(
        reflection,
        request.username
    )

    duplicate = False

    for memory in existing_memories:
        if reflection.lower() == memory.lower():
            duplicate = True
            break

    if not duplicate:
        save_memory(
            reflection,
            request.username
        )

    return {
        "response": response
    }

@app.post("/memories")
def memories(request: MemoryRequest):

    memories = recall_memory(
        "What do we know about this student?",
        request.username
    )

    print("MEMORIES:", memories)

    return {
        "memories": memories
    }