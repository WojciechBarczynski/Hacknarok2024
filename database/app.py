import psycopg2
import logging

from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/api/communication/get_users', methods=['GET'])
def get_users():
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users")
    users = cursor.fetchall()
    cursor.close()

    logging.debug("Users retrieved successfully.")
    return jsonify({"message": "Users retrieved successfully.", "users": users})


@app.route('/api/communication/get_records', methods=['GET'])
def get_records():
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM records")
    records = cursor.fetchall()
    cursor.close()

    logging.debug("Records retrieved successfully.")
    return jsonify({"message": "Records retrieved successfully.", "records": records})


@app.route('/api/communication/get_friends', methods=['GET'])
def get_friends():
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM friends")
    friends = cursor.fetchall()
    cursor.close()

    logging.debug("Friends retrieved successfully.")
    return jsonify({"message": "Friends retrieved successfully.", "friends": friends})


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
    time = data['time']
    address = data['address']
    operation = data['operation']

    cursor = conn.cursor()
    cursor.execute(f"INSERT INTO records (username, time, address, operation) VALUES ('{username}', '{time}', '{address}', '{operation}')")
    conn.commit()
    cursor.close()

    logging.info(f"Record {username} {time} {address} {operation} added successfully.")

    return jsonify({"message": "Record added successfully."})


@app.route('/api/communication/create_friend', methods=['POST'])
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


@app.route('/api/communication/get_user_friends', methods=['GET'])
def get_user_friends():
    user_id = request.args.get('user_id')

    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM friends WHERE user_id1 = {user_id} ORDER BY RANDOM() LIMIT 10")
    friends = cursor.fetchall()
    cursor.close()

    logging.debug(f"Friends of user {user_id} retrieved successfully.")
    return jsonify({"message": f"Friends of user {user_id} retrieved successfully.", "friends": friends})


@app.route('/api/communication/get_tmp', methods=['GET'])
def get_tmp():
    ...


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO, format='[%(asctime)s - %(levelname)s] - %(message)s')

    dbname = 'db'
    user = 'admin'
    password = 'admin'
    host = 'localhost'

    try:
        conn = psycopg2.connect(dbname=dbname, user=user, password=password, host=host)
        logging.info("Connected to the database.")
    except psycopg2.OperationalError as e:
        logging.error("Failed to connect to the database.")
        exit(1)
    
    app.run(debug=True)
    