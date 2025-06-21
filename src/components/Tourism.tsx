import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import L from "leaflet";

const Tourism = () => {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    fetch("/lagos_tourist_sites.geojson")
      .then((res) => res.json())
      .then((data) => setGeoData(data));
  }, []);

  // Add popup to each feature
  const onEachFeature = (feature: any, layer: L.Layer) => {
    const name = feature.properties?.name;
    const description = feature.properties?.description;
    if (name) {
      layer.bindPopup(`<strong>${name}</strong><br/>${description}`);
    }
  };

  return (
    <MapContainer
      center={[6.5244, 3.3792]} // Lagos center
      zoom={12}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />
      {geoData && <GeoJSON data={geoData} onEachFeature={onEachFeature} />}
    </MapContainer>
  );
};

export default Tourism;
