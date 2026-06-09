from memory import recall_memory

print("\n=== STUDENT KNOWLEDGE ===\n")

results = recall_memory("What do we know about this student?")

for i, memory in enumerate(results, start=1):
    print(f"{i}. {memory}")