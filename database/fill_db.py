import psycopg2
import logging
import datetime
import random

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO, format='[%(asctime)s - %(levelname)s] - %(message)s')

    dbname = 'db'
    user = 'admin'
    password = 'admin'
    host = 'localhost'

    conn = psycopg2.connect(dbname=dbname, user=user, password=password, host=host)

    USERNAMES = [f'user{i}' for i in range(10)]
    FRIENDSHIPS = [(i, i + 1) for i in range(0, 9, 2)]
    TIMESTAMPS = [datetime.datetime.now().isoformat() for _ in range(40)]
    DELTAS = [datetime.timedelta(minutes=random.randint(5, 20)) for _ in range(40)]
    DURATIONS = [random.randint(60, 300) for _ in range(40)]
    RESTRICTED_ADDRESSES = [
        'https://www.facebook.com',
        'https://www.instagram.com/',
        'https://www.tiktok.com/',
        'https://www.twitter.com/'
    ]
    SPECIAL_ADDRESSES = [
        'https://www.youtube.com/'
    ]
    OK_ADDRESSES = [
        'https://www.google.com/',
        'https://www.wikipedia.org/',
        'https://www.github.com/',
        'https://www.stackoverflow.com/'
    ]
    ADDRESSES = RESTRICTED_ADDRESSES + SPECIAL_ADDRESSES + OK_ADDRESSES

    # Create users
    cursor = conn.cursor()
    for username in USERNAMES:
        cursor.execute(f"INSERT INTO users (username) VALUES ('{username}')")
    conn.commit()

    # Create friendships
    cursor = conn.cursor()
    for user_id1, user_id2 in FRIENDSHIPS:
        cursor.execute(f"INSERT INTO friends (user_id1, user_id2) VALUES ({user_id1}, {user_id2})")
    conn.commit()

    # Create records
    cursor = conn.cursor()
    for idx in range(len(TIMESTAMPS)):
        username = random.choice(USERNAMES)
        open_time = TIMESTAMPS[idx]
        address = random.choice(ADDRESSES)
        operation = 'OPEN'
        cursor.execute(f"INSERT INTO records (username, time, address, operation) VALUES ('{username}', '{open_time}', '{address}', '{operation}')")
        close_time = datetime.datetime.fromisoformat(open_time) + datetime.timedelta(seconds=DURATIONS[idx])
        operation = 'CLOSE'
        cursor.execute(f"INSERT INTO records (username, time, address, operation) VALUES ('{username}', '{close_time}', '{address}', '{operation}')")
    conn.commit()
    logging.info("Data created successfully.")
