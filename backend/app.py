import psycopg2
import logging
import datetime
import ray
import requests

from flask import Flask, request, jsonify

app = Flask(__name__)

dbname = 'db'
user = 'admin'
password = 'admin'
host = 'localhost'

conn = psycopg2.connect(dbname=dbname, user=user, password=password, host=host)

from flask import Flask, jsonify, request
import requests
import datetime
import ray
import enum


class Operation(enum.Enum):
    UrlChange = 1,
    TabChange = 2,
    Remove = 3,


class record:
    def __init__(self, time, url, operation):
        self.time = time
        self.url = url
        self.operation = operation


app = Flask(__name__)


@ray.remote
def score(user):
    import random
    return [random.randint(1, 100) for _ in range(365)]


@app.route('/get_scores', methods=['GET'])
def get_scores():
    api_url = "http://54.210.118.222:80/api/communication/get_records"
    response = requests.get(api_url)
    
    users = {}

    if response.status_code == 200:
        data = response.json()
        for _, user, t, url, op in data['records']:
            if user not in users:
                users[user] = []
            users[user].append(record(t, url, op))
            
        scores = []
        for user in users:
            scores.append(score.remote(user))
        scores = ray.get(scores)

        output = {}
        for i, user in enumerate(users):
            output[user] = scores[i]

        print(output)

        return jsonify(output), 200
    else:
        return jsonify({"error": "Nie"}), response.status_code


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
    