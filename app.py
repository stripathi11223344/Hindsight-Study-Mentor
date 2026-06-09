from agent import ask_agent
from memory import save_memory, create_bank

create_bank()

print("Study Mentor Started")
print("Type exit to quit\n")

while True:

    user_input = input("You: ")

    if user_input.lower() == "exit":
        break

    response = ask_agent(user_input)

    print("\nAgent:", response)

    save_memory(user_input)

    print()