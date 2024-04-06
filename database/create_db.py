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
    cursor.execute("DROP TABLE IF EXISTS users CASCADE")
    cursor.execute("DROP TABLE IF EXISTS friends CASCADE")
    cursor.execute("DROP TABLE IF EXISTS records CASCADE")
    cursor.execute("DROP TABLE IF EXISTS scores CASCADE")
    conn.commit()

    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT);
    """)
    conn.commit()

    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE friends (
        user_id1 INTEGER NOT NULL,
        user_id2 INTEGER NOT NULL
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
