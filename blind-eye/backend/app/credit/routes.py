import os
import json
from urllib.parse import quote_plus
from flask import Flask, jsonify, request
from flask_cors import CORS
from sqlalchemy import create_engine, text

try:
    from dotenv import load_dotenv
    load_dotenv()  # .env in current directory
    load_dotenv(".env")  # fallback if you use .env.txt
except ImportError:
    pass  # install with: pip install python-dotenv

app = Flask(__name__)
CORS(app)

#Connecting to database
user = os.environ.get("DB_USER", "")
password = os.environ.get("DB_PASSWORD", "")
host = os.environ.get("DB_HOST", "")
port = os.environ.get("DB_PORT", "")
name = os.environ.get("DB_NAME", "")
if password:
    password = quote_plus(password)  # escape special chars like @ or :
DATABASE_URL = f"mysql+pymysql://{user}:{password}@{host}:{port}/{name}"
if DATABASE_URL == "mysql+pymysql://:@:/":
    print("Error: Access denied by environment variables")
    exit(1)
else:
    print("Database connected successfully by environment variables")
# connect_args: increase timeout for slow/remote MySQL (default 10s)
engine = create_engine(DATABASE_URL)

#Route to get credit score graph and sum
@app.route("/getCreditScoreGraph", methods = ['POST'])
def getCreditScoreGraph():
    data = request.get_json(silent=True) or {}
    business_id = data.get("business_id")
    if not business_id:
        return jsonify({"error": "Business ID is required"}), 400
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text("SELECT * FROM botb.Credit_Score_Events WHERE business_id = :business_id"),
                {"business_id": business_id},
            )
            print(result)
            rows = result.fetchall()
            result_list = [dict(row._mapping) for row in rows]
            credit_score = sum(row['amount'] for row in result_list)
            return jsonify({"message": "Credit score graph", "result": credit_score, "result_list": result_list}), 200
    except Exception as e:
        print(e)  # so you see the real error in the terminal
        return jsonify({"error": str(e)}), 500

#Route to add to the visibility events table
@app.route("/addVisibilityEvent", methods = ['POST'])
def addVisibilityEvent():
    data = request.get_json(silent=True) or {}
    business_id = data.get("business_id")
    amount = data.get("amount")
    if not business_id or not amount:
        return jsonify({"error": "Business ID and amount are required"}), 400
    try:
        with engine.connect() as conn:
            result = conn.execute(text("INSERT INTO Credit_Score_Events (business_id, amount) VALUES (:business_id, :amount)"), {"business_id": business_id, "amount": amount})
            conn.commit()
            return jsonify({"message": "Credit score event added successfully"}), 200
    except Exception as e:
        print(e)  # so you see the real error in the terminal
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)