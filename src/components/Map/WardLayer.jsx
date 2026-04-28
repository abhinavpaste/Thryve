import { CircleMarker, GeoJSON, Tooltip } from "react-leaflet";

function getColor(score) {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#84cc16";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

function styleFeature(feature) {
  const score = feature.properties?.score ?? 50;

  return {
    fillColor: getColor(score),
    fillOpacity: 0.28,
    color: "#94a3b8",
    weight: 1.2,
    opacity: 0.7,
  };
}

function onEachFeature(feature, layer) {
  const properties = feature.properties || {};
  const wardNames = (properties.ward_names || []).slice(0, 7).join(", ");
  const overflow = (properties.ward_names || []).length > 7 ? "…" : "";
  const zoneHistory = (properties.zone_history || [])
    .map((item) => `<li style="margin: 0 0 4px;">${item}</li>`)
    .join("");

  layer.bindPopup(`
    <div style="min-width: 240px; font-family: Inter, system-ui, sans-serif;">
      <h4 style="margin: 0 0 8px;">${properties.zone_name || "Zone"}</h4>
      <div><strong>Wards merged:</strong> ${properties.ward_count || 0}</div>
      <div style="margin-top: 6px;"><strong>Includes:</strong> ${wardNames}${overflow}</div>
      <div style="margin-top: 8px;"><strong>History:</strong></div>
      <ul style="margin: 4px 0 0 16px; padding: 0;">${zoneHistory}</ul>
    </div>
  `);

  layer.on({
    mouseover: (e) => {
      e.target.setStyle({
        fillOpacity: 0.42,
        weight: 2,
      });
      layer.openPopup();
    },
    mouseout: (e) => {
      e.target.setStyle({
        fillOpacity: 0.28,
        weight: 1.2,
      });
      layer.closePopup();
    },
    click: () => {
      console.log("Merged ward zone:", properties);
    },
  });
}

export default function WardLayer({ data, markers }) {
  if (!data) {
    return null;
  }

  return (
    <>
      <GeoJSON data={data} style={styleFeature} onEachFeature={onEachFeature} />

      {markers.map((marker) => (
        <CircleMarker
          key={marker.zoneId}
          center={marker.center}
          radius={16}
          pathOptions={{
            color: getColor(marker.score),
            fillColor: getColor(marker.score),
            fillOpacity: 0.35,
            weight: 2,
          }}
        >
          <Tooltip permanent direction="center" className="zone-count-tooltip">
            {marker.wardCount}
          </Tooltip>
        </CircleMarker>
      ))}
    </>
  );
}
