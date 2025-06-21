import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import L from "leaflet";

const Tourism = () => {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    fetch("/Lagos.geojson")
      .then((res) => res.json())
      .then((data) => setGeoData(data));
  }, []);

  return (
    <MapContainer
      center={[6.5244, 3.3792]}
      zoom={11}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {geoData && <GeoJSON data={geoData} />}
    </MapContainer>
  );
};

export default Tourism;
