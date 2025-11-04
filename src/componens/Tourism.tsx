/* eslint-disable @typescript-eslint/no-explicit-any */ 
import { MapContainer, TileLayer, GeoJSON, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { Viewer } from "mapillary-js";
import "mapillary-js/dist/mapillary.css";
import L from "leaflet";

const { BaseLayer, Overlay } = LayersControl;

const MAPILLARY_TOKEN =
  "MLY|24058407673812411|e7ae8c0fdc9e3f52abc823ef6706ca5f";

const Tourism = () => {
  const [geoData, setGeoData] = useState<any>(null);
  const [LagoslgaData, setLagoslgaData] = useState<any>(null);
  const [LagosroadData, setLagosroadData] = useState<any>(null);

  useEffect(() => {
    fetch("/Lagos.geojson")
      .then((res) => res.json())
      .then((data) => setGeoData(data));

    fetch("/Lagoslga.geojson")
      .then((res) => res.json())
      .then((data) => setLagoslgaData(data));

    fetch("/Lagosroad.geojson")
      .then((res) => res.json())
      .then((data) => setLagosroadData(data));
  }, []);

  const onEachFeature = (feature: any, layer: any) => {
    const name = feature.properties?.name || "Unknown Site";
    const description =
      feature.properties?.description || "No description available.";
    const imageKey = feature.properties?.mapillaryId;

    const containerId = `mly-${name.replace(/\s+/g, "-").toLowerCase()}`;
    const popupContent = document.createElement("div");
    popupContent.innerHTML = `
      <strong>${name}</strong><br/>
      ${description}<br/>
      <div id="${containerId}" style="width: 100%; height: 200px; margin-top: 10px;"></div>
    `;

    layer.bindPopup(popupContent);

    layer.on("popupopen", () => {
      const container = document.getElementById(containerId);
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
    });

    layer.on("click", (e: any) => {
      const latlng = e.latlng;
      layer._map.flyTo(latlng, 15, { duration: 2.5, animate: true });
    });
  };

  const lineStyle = {
    color: "yellow",
    weight: 2.5,
    opacity: 0.9,
  };

  const polygonStyle = {
    color: "green",
    weight: 1.5,
    fillOpacity: 0.3,
  };

  return (
    <MapContainer
      center={[6.5244, 3.3792]}
      zoom={11}
      style={{ height: "100vh", width: "100%" }}
      preferCanvas={true}
    >
      <LayersControl position="topright">
        <BaseLayer checked name="OpenStreetMap">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap"
            zIndex={1}
          />
        </BaseLayer>

        {LagoslgaData && (
          <Overlay checked name="LGA Boundaries">
            <GeoJSON
              data={LagoslgaData}
              style={polygonStyle}
              onEachFeature={onEachFeature}
            />
          </Overlay>
        )}
        {LagosroadData && (
          <Overlay checked name="Roads">
            <GeoJSON
              data={LagosroadData}
              style={lineStyle}
              onEachFeature={onEachFeature}
            />
          </Overlay>
        )}

        {geoData && (
          <Overlay checked name="Tourist Attractions">
            <GeoJSON
              data={geoData}
              pointToLayer={(_, latlng) => L.marker(latlng)}
              onEachFeature={onEachFeature}
            />
          </Overlay>
        )}
      </LayersControl>
    </MapContainer>
  );
};

export default Tourism;
