import { MapContainer, TileLayer, GeoJSON, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";

export default function Tourism() {
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    fetch("/lagos_libraries.geojson")
      .then((res) => res.json())
      .then((data) => setGeoData(data));
  }, []);

  const onEachFeature = (feature: any, layer: L.Layer) => {
    if (feature.properties) {
      const { name, address, hours } = feature.properties;
      layer.bindPopup(
        `<strong>${name}</strong><br/>${address}<br/>Hours: ${hours}`
      );
    }
  };

  return (
    <MapContainer
      center={[6.5244, 3.3792]}
      zoom={12}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {geoData && <GeoJSON data={geoData} onEachFeature={onEachFeature} />}
    </MapContainer>
  );
}
