import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from sklearn.preprocessing import MinMaxScaler
from datetime import datetime
import joblib
import os


df = pd.read_csv("database.csv")  


df['DateTime'] = pd.to_datetime(df['Date'] + ' ' + df['Time'], errors='coerce')
df.dropna(subset=['DateTime'], inplace=True)  


epoch = datetime(1970, 1, 1)
df['TimeStamp'] = df['DateTime'].apply(lambda x: (x - epoch).total_seconds())


df = df[['TimeStamp', 'Latitude', 'Longitude', 'Depth', 'Magnitude']]


lat = float(input("Enter Latitude: "))
long = float(input("Enter Longitude: "))
depth = float(input("Enter Depth: "))


location_radius = 1.0
filtered_df = df[(df['Latitude'].between(lat - location_radius, lat + location_radius)) & 
                 (df['Longitude'].between(long - location_radius, long + location_radius))]


while filtered_df.empty and location_radius <= 5.0:
    location_radius += 1.0
    filtered_df = df[(df['Latitude'].between(lat - location_radius, lat + location_radius)) & 
                     (df['Longitude'].between(long - location_radius, long + location_radius))]

if filtered_df.empty:
    print("No direct data available. Using global average values.")
    avg_lat = df['Latitude'].mean()
    avg_long = df['Longitude'].mean()
    avg_depth = df['Depth'].mean()
    avg_mag = df['Magnitude'].mean()
    filtered_df = df.copy()
else:
    avg_lat, avg_long, avg_depth, avg_mag = lat, long, depth, np.percentile(filtered_df['Magnitude'], 90)


threshold_mag = np.percentile(filtered_df['Magnitude'], 90)
print(f"Automatically determined threshold magnitude: {threshold_mag:.2f}")


filtered_df = filtered_df.sort_values(by='TimeStamp')
filtered_df['TimeDiff'] = filtered_df['TimeStamp'].diff().fillna(0)


features = ['TimeStamp', 'Latitude', 'Longitude', 'Depth', 'Magnitude']
X = filtered_df[features].values
y = filtered_df['TimeDiff'].values


scaler = MinMaxScaler()
X_scaled = scaler.fit_transform(X)


X_scaled = X_scaled.reshape(X_scaled.shape[0], 1, X_scaled.shape[1])


train_size = int(0.8 * len(X_scaled))
if train_size == 0:
    print("Not enough data to train the model.")
    exit()

X_train, X_test = X_scaled[:train_size], X_scaled[train_size:]
y_train, y_test = y[:train_size], y[train_size:]


model = Sequential([
    LSTM(64, activation='relu', return_sequences=True, input_shape=(1, X_scaled.shape[2])),
    Dropout(0.2),
    LSTM(32, activation='relu'),
    Dropout(0.2),
    Dense(1)
])


model.compile(optimizer='adam', loss='mse', metrics=['mae'])


if len(X_train) > 0:
    model.fit(X_train, y_train, epochs=50, batch_size=32, validation_data=(X_test, y_test))
else:
    print("Not enough training data. Try a different location.")
    exit()

scaler_filename = "scaler.pkl"
joblib.dump(scaler, scaler_filename)
print(f"Scaler saved as {scaler_filename}")


model_filename = "lstm_model.keras"
model.save(model_filename)
print(f"Model saved as {model_filename}")


input_data = np.array([[datetime.now().timestamp(), avg_lat, avg_long, avg_depth, threshold_mag]])
input_scaled = scaler.transform(input_data).reshape(1, 1, X_scaled.shape[2])
pred_time_diff = model.predict(input_scaled)[0][0]

pred_days = pred_time_diff / (60 * 60 * 24)
print(f"Predicted time until next earthquake ≥ {threshold_mag:.2f} magnitude: {pred_days:.2f} days")
