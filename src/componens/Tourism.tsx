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
    const [lon, lat] = feature.geometry?.coordinates || [3.3792, 6.5244];

    const popupContent = document.createElement("div");
    popupContent.innerHTML = `
    <strong>${name}</strong><br/>
    ${description}<br/>
    <div id="mly" style="width: 100%; height: 200px; margin-top: 10px;"></div>
  `;

    layer.bindPopup(popupContent);

    layer.on("click", async function (e: any) {
      const latlng = e.latlng;
      layer._map.flyTo(latlng, 15, { duration: 2.5 });

      // Wait for popup to mount
      setTimeout(async () => {
        const container = document.getElementById("mly");
        if (!container) return;

        try {
          const apiUrl = `https://graph.mapillary.com/images?access_token=${MAPILLARY_TOKEN}&fields=id&closeto=${lon},${lat}&limit=1`;
          const res = await fetch(apiUrl);
          const data = await res.json();
          const imageId = data.data?.[0]?.id;

          if (imageId) {
            new Viewer({
              container,
              imageId,
              accessToken: MAPILLARY_TOKEN,
            });
          } else {
            container.innerHTML = "No street view found near this site.";
          }
        } catch (error) {
          container.innerHTML = "Street view failed to load.";
          console.error("Mapillary error:", error);
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
