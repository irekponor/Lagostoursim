/* eslint-disable @typescript-eslint/no-explicit-any */
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import "mapillary-js/dist/mapillary.css";

const MAPILLARY_TOKEN =
  "MLY|24058407673812411|e7ae8c0fdc9e3f52abc823ef6706ca5f";

const Tourism = () => {
  const [geoData, setGeoData] = useState<any>(null);
  const [showStreetView, setShowStreetView] = useState(false);
  const [viewer, setViewer] = useState<any>(null);

  useEffect(() => {
    fetch("/Lagos.geojson")
      .then((res) => res.json())
      .then((data) => setGeoData(data));
  }, []);

  useEffect(() => {
    if (showStreetView && !viewer) {
      const loadViewer = async () => {
        const mapillary = await import("mapillary-js");
        const v = new mapillary.Viewer({
          container: "mly-fullscreen",
          //@ts-expect-error: accessToken is valif at runtime even if type is missing
          accessToken: MAPILLARY_TOKEN,
          imageId: "543076233295506", // A valid image in Lagos
        });
        setViewer(v);
      };
      loadViewer();
    }
  }, [showStreetView, viewer]);

  const toggleStreetView = () => {
    setShowStreetView((prev) => !prev);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={toggleStreetView}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          zIndex: 1000,
          padding: "8px 12px",
          background: "#000",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {showStreetView ? "Back to Map" : "Street View Mode"}
      </button>

      {!showStreetView ? (
        <MapContainer
          center={[6.5244, 3.3792]}
          zoom={11}
          style={{ height: "100vh", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap"
          />
          {geoData && <GeoJSON data={geoData} />}
        </MapContainer>
      ) : (
        <div
          id="mly-fullscreen"
          style={{ height: "100vh", width: "100%" }}
        ></div>
      )}
    </div>
  );
};

export default Tourism;
