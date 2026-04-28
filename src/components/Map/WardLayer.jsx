import { GeoJSON } from "react-leaflet";

function getColor(score) {
  if (score >= 80) return "#2dcc70";
  if (score >= 60) return "#cca53f";
  if (score >= 40) return "#d27a34";
  return "#b64842";
}

function getWardScore(feature) {
  const wardNumber = Number(feature.properties?.KGISWardNo ?? 0);
  const centroidSeed = feature.geometry?.coordinates?.[0]?.[0] ?? [0, 0];
  const seed = Math.abs(Math.round((centroidSeed[0] * 1000) + (centroidSeed[1] * 1000)));
  return (wardNumber * 17 + seed) % 101;
}

function styleFeature(feature = {}) {
  const score = getWardScore(feature);

  return {
    fillColor: getColor(score),
    fillOpacity: 0.34,
    color: "#a6bcf7",
    weight: 1.35,
    opacity: 0.55,
    className: "ward-boundary",
  };
}

function glowStyleFeature() {
  return {
    fillOpacity: 0,
    color: "#c7d7ff",
    weight: 4.2,
    opacity: 0.42,
    className: "ward-boundary-glow",
    interactive: false,
  };
}

function onEachFeature(feature, layer) {
  const properties = feature.properties || {};

  layer.bindPopup(`
    <div style="min-width: 240px; font-family: Inter, system-ui, sans-serif;">
      <h4 style="margin: 0 0 8px;">${properties.KGISWardName || "Ward"}</h4>
      <div><strong>Ward No:</strong> ${properties.KGISWardNo || "-"}</div>
      <div style="margin-top: 6px;"><strong>Sustainability score:</strong> ${getWardScore(feature)}</div>
    </div>
  `);

  layer.on({
    mouseover: (e) => {
      e.target.setStyle({
        fillOpacity: 0.56,
        weight: 2.1,
        color: "#d8e4ff",
      });
      e.target.bringToFront();
    },
    mouseout: (e) => {
      e.target.setStyle({
        fillOpacity: 0.34,
        weight: 1.35,
        color: "#a6bcf7",
      });
      layer.closePopup();
    },
    click: () => {
      layer.openPopup();
      console.log("Ward:", properties);
    },
  });
}

export default function WardLayer({ data }) {
  if (!data) {
    return null;
  }

  return (
    <>
      <GeoJSON data={data} style={glowStyleFeature} pane="ward-boundary-glow" />
      <GeoJSON data={data} style={styleFeature} onEachFeature={onEachFeature} pane="ward-polygons" />
    </>
  );
}
