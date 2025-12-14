import React , { useEffect }from 'react'
import "./mapcomponent.scss"
import { MapContainer, TileLayer, Marker, Popup ,useMap} from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";


const customIcon = new L.Icon({
    iconUrl: markerIconPng,
    shadowUrl: markerShadowPng,
    iconSize: [25, 41], 
    iconAnchor: [12, 41], 
  });

  function MapAutoZoom({ position }) {
    const map = useMap();
  
    useEffect(() => {
      if (position) {
        const bounds = L.latLngBounds(position);
        map.fitBounds(bounds, {padding: [80, 80],       
          maxZoom: 10,} );  
      }
    }, [position, map]);
  
    return null;
  }
  

function MapComponent({item, prediction}) {
    const position = [28.6139, 77.2090]
    const markerPosition = item && item.latitude && item.longitude
    ? [item.latitude, item.longitude]
    : position;

  return (
        
   
    <MapContainer center={position} zoom={5} scrollWheelZoom={false}  className="map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {item && <MapAutoZoom position={[markerPosition]} />}

        {item && item.latitude && item.longitude &&(
        <Marker position={[item.latitude, item.longitude]} icon={customIcon}>
          <Popup>
           <b>Magnitude : {prediction}</b>
          </Popup>
        </Marker>)}
      </MapContainer>
    
  )
}

export default MapComponent
