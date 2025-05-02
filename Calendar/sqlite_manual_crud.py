import sqlite3

# Connect to the SQLite database file
conn = sqlite3.connect("calendardb_rd.sqlite3")
cursor = conn.cursor()

# Define the SQL statement with a parameter placeholder
for i in range(54, 55):
    try:
        # Execute the SQL command using a parameterized query to safely inject the value
        sql_delete = "DELETE FROM boards_calendar WHERE id = ?"
        cursor.execute(sql_delete, (i,))
        
        # Commit the changes to the database
        conn.commit()

        sql_delete = "DELETE FROM boards_subtask WHERE calendar_id = ?"
        cursor.execute(sql_delete, (i,))
        
        # Commit the changes to the database
        conn.commit()
        
        print(f"Record with id={i} has been successfully deleted from board_calendar.")
        
    except sqlite3.Error as e:
        print("An error occurred:", e)
        
conn.close()
