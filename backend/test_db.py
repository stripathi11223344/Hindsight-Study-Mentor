from auth import get_db_connection


try:
    connection = get_db_connection()

    print("✅ DATABASE CONNECTION SUCCESSFUL!")

    cursor = connection.cursor()

    cursor.execute("SELECT DATABASE();")
    database = cursor.fetchone()

    print("Connected database:", database[0])

    cursor.execute("SELECT COUNT(*) FROM users;")
    user_count = cursor.fetchone()

    print("Users table exists.")
    print("Current users:", user_count[0])

    cursor.execute("SELECT COUNT(*) FROM student_profiles;")
    profile_count = cursor.fetchone()

    print("Student profiles table exists.")
    print("Current profiles:", profile_count[0])

    cursor.close()
    connection.close()

    print("✅ MySQL test completed successfully.")


except Exception as error:
    print("❌ DATABASE CONNECTION FAILED")
    print("Error:", error)