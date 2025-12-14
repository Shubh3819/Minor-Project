from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
import joblib
from datetime import datetime, timedelta


app = Flask(__name__)
CORS(app)  


model = load_model("lstm_model.keras")
scaler = joblib.load("scaler.pkl")

@app.route("/")
def home():
    return jsonify({"message": "Earthquake Prediction API is running!"})

@app.route("/predict", methods=["POST"])
def predict_earthquake():
    try:
     
        data = request.get_json()
        lat = float(data.get("latitude"))
        long = float(data.get("longitude"))
        depth = float(data.get("depth"))
        date_str = data.get("date")  
        
      
        input_date = datetime.strptime(date_str, "%Y-%m-%d")
     
        threshold_mag = 5.0  
    
        input_data = np.array([[input_date.timestamp(), lat, long, depth, threshold_mag]])

        input_scaled = scaler.transform(input_data).reshape(1, 1, input_data.shape[1])

        
        pred_time_diff = float(model.predict(input_scaled)[0][0])
        
        
        pred_days = round(pred_time_diff / (60 * 60 * 24), 2)

       
        predicted_date = input_date + timedelta(days=pred_days)
        earthquake_date_str = predicted_date.strftime("%Y-%m-%d")
        
        
        estimated_magnitude = round(threshold_mag + np.random.normal(-0.5, 0.5), 1)
        estimated_magnitude = max(estimated_magnitude, threshold_mag - 0.5) 

     
        return jsonify({
            "prediction": str(estimated_magnitude),  
            "estimated_days": str(pred_days),        
            "earthquake_date": earthquake_date_str,  
            "latitude": lat,
            "longitude": long,
            "depth": depth
        })

    except Exception as e:
        print(f"Error in prediction: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)