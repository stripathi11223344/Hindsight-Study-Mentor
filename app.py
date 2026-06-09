from agent import ask_agent
from memory import save_memory, create_bank, recall_memory
from reflection import generate_reflection

create_bank()

print("Study Mentor Started")
print("Type exit to quit\n")

while True:

    user_input = input("You: ")

    if user_input.lower() == "exit":
        break
    if user_input.lower() == "show memories":

        memories = recall_memory(
            "What do we know about this student?"
        )

        print("\n=== STUDENT KNOWLEDGE ===\n")

        for i, memory in enumerate(memories, start=1):
            print(f"{i}. {memory}")

        print()
        continue

    response = ask_agent(user_input)

    print("\nAgent:", response)

    reflection = generate_reflection(user_input)

    if reflection != "NONE":
        save_memory(reflection)
        print("\n[Memory Saved]")

    

    print()