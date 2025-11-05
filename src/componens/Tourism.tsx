 /* eslint-disable @typescript-eslint/no-explicit-any */
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  LayersControl,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { Viewer } from "mapillary-js";
import "mapillary-js/dist/mapillary.css";
import L from "leaflet";
import { GeoSearchControl } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";

const { BaseLayer, Overlay } = LayersControl;

const MAPILLARY_TOKEN =
  "MLY| ";

const SearchControl = ({ geoData, lgaData, roadData }: any) => {
  const map = useMap();

  useEffect(() => {
    const searchControl = new (GeoSearchControl as any)({
      provider: { search: () => Promise.resolve([]) },
      style: "bar",
      showMarker: false,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      searchLabel: "Search Lagos dataset...",
      keepResult: true,
    });

    map.addControl(searchControl);

    const interval = setInterval(() => {
      const input = document.querySelector(
        ".leaflet-control-geosearch input"
      ) as HTMLInputElement | null;

      if (!input) return;

      clearInterval(interval);

      input.addEventListener("keydown", (e) => {
        if (e.key !== "Enter") return;

        const query = input.value.toLowerCase().trim();
        if (!query) return;

        const allFeatures = [
          ...(geoData?.features || []),
          ...(lgaData?.features || []),
          ...(roadData?.features || []),
        ];

        const found = allFeatures.find(
          (f: any) =>
            f?.properties?.name &&
            f.properties.name.toLowerCase().includes(query)
        );

        if (found) {
          const layer = L.geoJSON(found);
          const bounds = layer.getBounds();

          if (bounds.isValid()) {
            map.fitBounds(bounds, { maxZoom: 15 });
          } else if (found.geometry?.type === "Point") {
            const [lon, lat] = found.geometry.coordinates;
            map.flyTo([lat, lon], 15, { animate: true, duration: 1.2 });
          }

          const popupLatLng =
            found.geometry?.type === "Point"
              ? [found.geometry.coordinates[1], found.geometry.coordinates[0]]
              : bounds.getCenter();

          L.popup()
          //@ts-ignore: acessToken is valid at runtime even if type is missing
            .setLatLng(popupLatLng)
            .setContent(
              `<b>${found.properties.name}</b><br/>${
                found.properties.description || ""
              }`
            )
            .openOn(map);
        } else {
          L.popup()
            .setLatLng(map.getCenter())
            .setContent("<b>Place not found.</b>")
            .openOn(map);
        }
      });
    }, 300);

    return () => {
      clearInterval(interval);
      map.removeControl(searchControl);
    };
  }, [map, geoData, lgaData, roadData]);

  return null;
};

const Tourism = () => {
  const [geoData, setGeoData] = useState<any>(null);
  const [lagosLgaData, setLagosLgaData] = useState<any>(null);
  const [lagosRoadData, setLagosRoadData] = useState<any>(null);

  useEffect(() => {
    fetch("/Lagos.geojson")
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch(() => setGeoData(null));

    fetch("/Lagoslga.geojson")
      .then((res) => res.json())
      .then((data) => setLagosLgaData(data))
      .catch(() => setLagosLgaData(null));

    fetch("/Lagosroad.geojson")
      .then((res) => res.json())
      .then((data) => setLagosRoadData(data))
      .catch(() => setLagosRoadData(null));
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

        {lagosLgaData && (
          <Overlay checked name="LGA Areas">
            <GeoJSON
              data={lagosLgaData}
              style={polygonStyle}
              onEachFeature={onEachFeature}
            />
          </Overlay>
        )}

        {lagosRoadData && (
          <Overlay checked name="Roads">
            <GeoJSON
              data={lagosRoadData}
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

      <SearchControl
        geoData={geoData}
        lgaData={lagosLgaData}
        roadData={lagosRoadData}
      />
    </MapContainer>
  );
};

export default Tourism;
