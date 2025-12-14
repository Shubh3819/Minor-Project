import React from 'react'
import "./home.scss"
import MapComponent from '../component/map/MapComponent'
import { useState } from 'react';
import axios from "axios";

function Home() {
  const [formData, setFormData] = useState({
    latitude: "",
    longitude: "",
    depth: "",
    date: "",
  });

  const [submittedData, setsubmittedData] = useState(null)
  const [prediction, setPrediction] = useState(""); 
  const [estimatedDays, setEstimatedDays] = useState("");
  const [earthquakeDate, setEarthquakeDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: id === "date" ? value : value ? Number(value) : "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting data:", formData);
    
    if(!formData.latitude || !formData.longitude || !formData.date || !formData.depth){
      alert("Please fill the complete form");
      return;
    }
 
    setLoading(true);
    setError("");
    
    try {
      
      const response = await axios.post(`${BACKEND_URL}/predict`, formData, {
        timeout: 10000,  
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Response received:", response.data);
      setPrediction(response.data.prediction);
      setEstimatedDays(response.data.estimated_days);
      setEarthquakeDate(response.data.earthquake_date);
      setsubmittedData(formData);
      alert("Earthquake data submitted successfully!");
    } catch (error) {
      console.error("Error sending data:", error);
      if (error.code === 'ECONNREFUSED') {
        setError("Cannot connect to the server. Make sure the Flask backend is running.");
      } else if (error.response) {
        setError(`Server error: ${error.response.data.error || error.response.statusText}`);
      } else if (error.request) {
      
        setError("No response from server. Check if the backend is running.");
      } else {
        setError("Failed to fetch prediction. Please try again.");
      }
    } finally {
      setLoading(false);
    } 
  }

  const handleclear = (e) => {
    setFormData({latitude: "", longitude: "", depth: "", date: ""});
    setsubmittedData(null);
    setPrediction("");
    setEstimatedDays("");
    setEarthquakeDate("");
    setError("");
  }

  return (
    <div className="wrapper">
      <div className="input-wrap">
        <div className="name">
          <div className="items">
            <form className="earthquake-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="latitude">Latitude</label>
                <input
                  type="number"
                  id="latitude"
                  placeholder="Enter latitude"
                  min="-90"
                  max="90"
                  step="any"
                  value={formData.latitude}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="longitude">Longitude</label>
                <input
                  type="number"
                  id="longitude"
                  placeholder="Enter Longitude"
                  min="-180"
                  max="180"
                  step="any"
                  value={formData.longitude}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="depth">Depth</label>
                <input
                  type="number"
                  id="depth"
                  placeholder="Enter Depth"
                  min="0"
                  step="any"
                  value={formData.depth}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  placeholder="Select Date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="buttons">
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? "Submitting..." : "Submit"}
                </button>
                <button 
                  type="button" 
                  className="btn-clear" 
                  onClick={handleclear} 
                  disabled={!formData.latitude && !formData.longitude && !formData.depth && !formData.date}
                >
                  Clear
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="mapconatiner"> 
          <MapComponent item={submittedData} prediction={prediction}/>
        </div>
      </div>
      <div className="output-wrap">
        <div className="outputs">
          <label htmlFor="output">Prediction</label>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <p>{prediction ? `Estimated magnitude: ${prediction}` : "No prediction yet"}</p>
              {estimatedDays && (
                <p>Estimated days until earthquake: {estimatedDays}</p>
              )}
              {earthquakeDate && (
                <p>Predicted earthquake date: {earthquakeDate}</p>
              )}
            </>
          )}
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </div>
    </div>
  )
}

export default Home