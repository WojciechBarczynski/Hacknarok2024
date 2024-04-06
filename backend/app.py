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

if __name__ == '__main__':
    app.run(debug=True, port=5001)
