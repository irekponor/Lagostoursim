/* eslint-disable @typescript-eslint/no-explicit-any */
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { Viewer } from "mapillary-js";
import "mapillary-js/dist/mapillary.css";

const MAPILLARY_TOKEN =
  "MLY|24058407673812411|e7ae8c0fdc9e3f52abc823ef6706ca5f";

const Tourism = () => {
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    fetch("/Lagos.geojson")
      .then((res) => res.json())
      .then((data) => setGeoData(data));
  }, []);

  const onEachFeature = (feature: any, layer: any) => {
    const name = feature.properties?.name || "Unknown Site";
    const description =
      feature.properties?.description || "No description available.";
    const imageKey = feature.properties?.mapillaryId;

    const popupContent = document.createElement("div");
    popupContent.innerHTML = `
      <strong>${name}</strong><br/>
      ${description}<br/>
      <div id="mly" style="width: 100%; height: 200px; margin-top: 10px;"></div>
    `;

    layer.bindPopup(popupContent);

    layer.on("click", function (e: any) {
      const latlng = e.latlng;
      layer._map.flyTo(latlng, 15, { duration: 2.5, animate: true });

      setTimeout(() => {
        const container = document.getElementById("mly");
        if (container) {
          if (imageKey) {
            new Viewer({
              container,
              imageId: imageKey,
              // @ts-expect-error: accessToken is valid at runtime even if type is missing
              accessToken: MAPILLARY_TOKEN,
            });
          } else {
            container.innerHTML = "No street view available.";
          }
        }
      }, 500);
    });
  };

  return (
    <MapContainer
      center={[6.5244, 3.3792]}
      zoom={11}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap"
      />
      {geoData && <GeoJSON data={geoData} onEachFeature={onEachFeature} />}
    </MapContainer>
  );
};

export default Tourism;
