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
    fillOpacity: 0.32,
    color: "#ffffff",
    weight: 2.2,
    opacity: 0.95,
    className: "chunk-boundary",
  };
}

function glowStyleFeature() {
  return {
    fillOpacity: 0,
    color: "#ffffff",
    weight: 8,
    opacity: 0.5,
    className: "chunk-boundary-glow",
    interactive: false,
  };
}

function onEachFeature(feature, layer) {
  const properties = feature.properties || {};

  layer.bindPopup(`
    <div style="min-width: 240px; font-family: Inter, system-ui, sans-serif;">
      <h4 style="margin: 0 0 8px;">${properties.zone_name || "Zone"}</h4>
      <div><strong>Total wards merged:</strong> ${properties.ward_count || 0}</div>
      <div style="margin-top: 6px;"><strong>Ward number span:</strong> ${properties.ward_number_min ?? 0} - ${properties.ward_number_max ?? 0}</div>
      <div style="margin-top: 6px;"><strong>Average ward number:</strong> ${properties.ward_number_avg ?? "0.0"}</div>
    </div>
  `);

  layer.on({
    mouseover: (e) => {
      e.target.setStyle({
        fillOpacity: 0.62,
        weight: 2.8,
        color: "#ffffff",
      });
      e.target.bringToFront();
    },
    mouseout: (e) => {
      e.target.setStyle({
        fillOpacity: 0.32,
        weight: 2.2,
        color: "#ffffff",
      });
      layer.closePopup();
    },
    click: () => {
      layer.openPopup();
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
      <GeoJSON data={data} style={glowStyleFeature} pane="chunk-boundary-glow" />
      <GeoJSON data={data} style={styleFeature} onEachFeature={onEachFeature} pane="chunk-polygons" />

      {markers.map((marker) => (
        <CircleMarker
          key={marker.zoneId}
          center={marker.center}
          radius={16}
          pane="chunk-markers"
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
