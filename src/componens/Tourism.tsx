/* eslint-disable @typescript-eslint/no-explicit-any */
import { MapContainer, TileLayer, GeoJSON, useMapEvents } from "react-leaflet";
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
              accessToken: MAPILLARY_TOKEN,
            });
          } else {
            container.innerHTML = "No street view available.";
          }
        }
      }, 500);
    });
  };

  // 👇 Component to show street view on zoom level >= 17
  const StreetViewOnZoom = () => {
    useMapEvents({
      zoomend: async (e) => {
        const map = e.target;
        const zoom = map.getZoom();

        if (zoom >= 17) {
          const center = map.getCenter();

          try {
            const res = await fetch(
              `https://graph.mapillary.com/images?access_token=${MAPILLARY_TOKEN}&fields=id&closeto=${center.lng},${center.lat}&limit=1`
            );
            const data = await res.json();
            const imageId = data?.data?.[0]?.id;

            const container = document.getElementById("mly-zoom-view");
            if (container) {
              if (imageId) {
                new Viewer({
                  container,
                  imageId,
                  accessToken: MAPILLARY_TOKEN,
                });
              } else {
                container.innerHTML = "No nearby street view found.";
              }
            }
          } catch (err) {
            console.error("Failed to fetch Mapillary image:", err);
          }
        }
      },
    });

    return null;
  };

  return (
    <>
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
        <StreetViewOnZoom />
      </MapContainer>

      {/* Street View Viewer Box */}
      <div
        id="mly-zoom-view"
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          width: "300px",
          height: "200px",
          zIndex: 999,
          background: "#fff",
          boxShadow: "0 0 10px rgba(0,0,0,0.2)",
        }}
      ></div>
    </>
  );
};

export default Tourism;
