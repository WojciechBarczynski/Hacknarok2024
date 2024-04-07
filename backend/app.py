import psycopg2
import logging
import datetime
import ray
import requests
import enum

from flask import Flask, request, jsonify
from random import randint
from copy import deepcopy

app = Flask(__name__)

dbname = 'db'
user = 'admin'
password = 'admin'
host = 'localhost'

conn = psycopg2.connect(dbname=dbname, user=user, password=password, host=host)


class Operation(enum.Enum):
    UrlChange = 1,
    TabChange = 2,
    Remove = 3,


@app.route('/mock/get_scores', methods=['GET'])
def mockup():
    output = {
        'areczek': [randint(0, 40) for _ in range(365)],
        'womziak': [randint(0, 10) for _ in range(365)],
        'wojtus': [randint(1, 3) * 33 for _ in range(365)],
        'rusiek': [randint(50, 100) for _ in range(365)]
    }
    return jsonify(output), 200


@ray.remote
def score(user):
    output = []
    users_update = []
    for t, url, op in user:
        new_t = datetime.datetime.strptime(t, "%Y-%m-%dT%H:%M:%S.%f")
        new_t = new_t.strftime("%Y-%m-%d")
        users_update.append((new_t, url, op))
    user = users_update
    
    now = datetime.datetime.now()
    current_date = now.strftime("%Y-%m-%d")
    for i in range(365):
        hist_date = now - datetime.timedelta(days=i)
        hist_date = hist_date.strftime("%Y-%m-%d")
        user_cp = [(date, url, op) for date, url, op in user if date == hist_date]
        if len(user_cp) == 0:
            output.append(0)
            continue
        ok, total = 0, 0
        for _, url, _ in user_cp:
            url = url.lower()
            total += 1
            if (
                url.find('facebook') == -1 and
                url.find('youtube') == -1 and
                url.find('twitter') == -1 and
                url.find('instagram') == -1 and 
                url.find('tiktok') == -1
            ):
                ok += 1
        output.append(int(100 * ok / total))
    
    return output



@app.route('/api/get_scores', methods=['GET'])
def get_scores():
    data = get_records().json
    users = {}

    for _, user, t, url, op in data['records']:
        if user not in users:
            users[user] = []
        users[user].append((t, url, op))

    scores = []
    for key, value in users.items():
        scores.append(score.remote(value))
    scores = ray.get(scores)

    output = {}
    for dict_it, u_score in zip(users.items(), scores):
        user, _ = dict_it
        output[user] = u_score

    return jsonify(output), 200


@app.route('/api/communication/get_users', methods=['GET'])
def get_users():
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users")
    users = cursor.fetchall()

    output = {}

    for user in users:
        output[user[0]] = user[1]
    cursor.close()

    logging.info("Users retrieved successfully.")

    return jsonify({"message": "Users retrieved successfully.", "users": output})


@app.route('/api/communication/get_records', methods=['GET'])
def get_records():
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM records")
    records = cursor.fetchall()
    cursor.close()

    logging.info("Records retrieved successfully.")

    return jsonify({"message": "Records retrieved successfully.", "records": records})


@app.route('/api/communication/get_friends', methods=['GET'])
def get_friends():
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM friends")
    friends = cursor.fetchall()
    cursor.close()

    logging.info("Friends retrieved successfully.")

    return jsonify({"message": "Friends retrieved successfully.", "friends": friends})


@app.route('/api/communication/get_user_friends', methods=['GET'])
def get_user_friends():
    user_id = request.args.get('user_id')

    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM friends WHERE user_id1 = {user_id} ORDER BY RANDOM() LIMIT 10")
    friends = cursor.fetchall()
    cursor.close()

    logging.info(f"Friends of user {user_id} retrieved successfully.")

    return jsonify({"message": f"Friends of user {user_id} retrieved successfully.", "friends": friends})


@app.route('/api/communication/create_user', methods=['POST'])
def create_user():
    data = request.json
    username = data['username']

    cursor = conn.cursor()
    cursor.execute(f"INSERT INTO users (username) VALUES ('{username}')")
    conn.commit()
    cursor.close()

    logging.info(f"User {username} created successfully.")

    return jsonify({"message": "User created successfully."})


@app.route('/api/communication/create_record', methods=['POST'])
def create_record():
    data = request.json
    username = data['username']
    time = datetime.datetime.now().isoformat()
    address = data['address']
    operation = data['operation']

    cursor = conn.cursor()
    cursor.execute(f"INSERT INTO records (username, time, address, operation) VALUES ('{username}', '{time}', '{address}', '{operation}')")
    conn.commit()
    cursor.close()

    logging.info(f"Record {username} {time} {address} {operation} added successfully.")

    return jsonify({"message": "Record added successfully."})


@app.route('/api/communication/create_friendship', methods=['POST'])
def create_friendship():
    data = request.json
    user_id1 = data['user_id1']
    user_id2 = data['user_id2']

    cursor = conn.cursor()
    cursor.execute(f"INSERT INTO friends (user_id1, user_id2) VALUES ({user_id1}, {user_id2})")
    conn.commit()
    cursor.close()

    logging.info(f"Friendship {user_id1} {user_id2} added successfully.")

    return jsonify({"message": "Friendship added successfully."})


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO, format='[%(asctime)s - %(levelname)s] - %(message)s')

    try:
        conn = psycopg2.connect(dbname=dbname, user=user, password=password, host=host)
        logging.info("Connected to the database.")
    except psycopg2.OperationalError as e:
        logging.error("Failed to connect to the database.")
        exit(1)
    
    app.run(debug=True)
    