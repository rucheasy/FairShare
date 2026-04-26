from flask import Flask, jsonify
from flask_cors import CORS
from routes.groups import groups_bp
from routes.expenses import expenses_bp

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

app.register_blueprint(groups_bp, url_prefix='/api')
app.register_blueprint(expenses_bp, url_prefix='/api')

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "FairShare API is running"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
