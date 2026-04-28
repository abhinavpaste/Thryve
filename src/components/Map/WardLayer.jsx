import { GeoJSON } from "react-leaflet";

// color scale (clean + readable)
function getColor(score) {
  if (score >= 80) return "#22c55e";   // green
  if (score >= 60) return "#84cc16";   // lime
  if (score >= 40) return "#f97316";   // orange
  return "#ef4444";                    // red
}

// styling each ward
function styleFeature(feature) {
  // fallback ID if ward_id doesn't exist
  const id =
    feature.properties.ward_id ||
    feature.properties.WARD_NO ||
    feature.properties.id ||
    1;

  const zoneId = Math.floor(id / 5);

  const zoneScore = (zoneId * 23) % 100;

  return {
    fillColor: getColor(zoneScore),
    fillOpacity: 0.25,
    color: "#94a3b8",
    weight: 0.8,
    opacity: 0.4,
  };
}

// interactions (hover + click)
function onEachFeature(feature, layer) {
  layer.on({
    mouseover: (e) => {
      e.target.setStyle({
        fillOpacity: 0.4,
        weight: 1.5,
      });
    },
    mouseout: (e) => {
      e.target.setStyle({
        fillOpacity: 0.25,
        weight: 0.8,
      });
    },
    click: () => {
      console.log("Ward:", feature.properties);
    },
  });
}

export default function WardLayer({ data }) {
  return (
    <GeoJSON
      data={data}
      style={styleFeature}
      onEachFeature={onEachFeature}
    />
  );
}