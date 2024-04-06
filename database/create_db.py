import psycopg2
import logging

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO, format='[%(asctime)s - %(levelname)s] - %(message)s')

    dbname = 'db'
    user = 'admin'
    password = 'admin'
    host = 'localhost'

    conn = psycopg2.connect(dbname=dbname, user=user, password=password, host=host)

    cursor = conn.cursor()
    cursor.execute("DROP TABLE IF EXISTS users")
    cursor.execute("DROP TABLE IF EXISTS friends")
    cursor.execute("DROP TABLE IF EXISTS records")
    cursor.execute("DROP TABLE IF EXISTS scores")
    conn.commit()

    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT)
    """)
    conn.commit()

    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE friends (
        user_id1 INTEGER NOT NULL,
        user_id2 INTEGER NOT NULL,
        PRIMARY KEY (
            user_id1,
            user_id2
        ),
        CONSTRAINT fk_user1 FOREIGN KEY (user_id1) 
            REFERENCES uzytkownicy (id)
            ON DELETE CASCADE,
        CONSTRAINT fk_user2 FOREIGN KEY (user_id2) 
            REFERENCES uzytkownicy (id)
            ON DELETE CASCADE,
    );
    """
    )
    conn.commit()

    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE records (
        id SERIAL PRIMARY KEY,
        username TEXT,
        time TEXT,
        address TEXT,
        operation TEXT
    );
    """)
    conn.commit()

    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE scores (
        id SERIAL PRIMARY KEY,
        username TEXT,
        time TEXT,
        score INTEGER
    );
    """)

    cursor.close()
    conn.close()

    logging.info("Database recreated successfully.")
