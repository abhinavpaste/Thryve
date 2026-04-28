import { CircleMarker, GeoJSON, Tooltip } from "react-leaflet";

/* ---------- COLOR LOGIC ---------- */
function getColor(score) {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#84cc16";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

/* ---------- MAIN STYLE ---------- */
function styleFeature(feature) {
  const score = feature.properties?.score ?? 50;

  return {
    fillColor: getColor(score),
    fillOpacity: 0.22,

    color: "#94a3b8",   // soft boundary
    weight: 0.6,
    opacity: 0.25,
  };
}

/* ---------- GLOW ---------- */
function glowStyleFeature() {
  return {
    fillOpacity: 0,
    color: "#ffffff",
    weight: 2,
    opacity: 0.12,
    interactive: false,
  };
}

/* ---------- INTERACTIONS ---------- */
function onEachFeature(feature, layer, onZoneClick) {
  const properties = feature.properties || {};

  layer.bindPopup(`
    <div style="min-width: 200px; font-family: Inter;">
      <h4>${properties.zone_name || "Zone"}</h4>
      <div>Wards: ${properties.ward_count || 0}</div>
    </div>
  `);

  layer.on({
    mouseover: (e) => {
      e.target.setStyle({
        fillOpacity: 0.35,
      });
    },

    mouseout: (e) => {
      e.target.setStyle({
        fillOpacity: 0.22,
      });
    },

    click: () => {
      if (onZoneClick) {
        onZoneClick(properties.zone_id); // 🔥 key line
      }
    },
  });
}

/* ---------- COMPONENT ---------- */
export default function WardLayer({
  data,
  markers = [],
  onZoneClick,
}) {
  if (!data) return null;

  return (
    <>
      {/* Glow layer */}
      <GeoJSON
        data={data}
        style={glowStyleFeature}
        pane="chunk-boundary-glow"
      />

      {/* Main polygons */}
      <GeoJSON
        data={data}
        style={styleFeature}
        onEachFeature={(feature, layer) =>
          onEachFeature(feature, layer, onZoneClick)
        }
        pane="chunk-polygons"
      />

      {/* Markers */}
      {markers.map((marker) => (
        <CircleMarker
          key={marker.zoneId}
          center={marker.center}
          radius={20}
          pane="chunk-markers"
          pathOptions={{
            color: getColor(marker.score),
            fillColor: getColor(marker.score),
            fillOpacity: 0.18,
            weight: 2,
          }}
        >
          <Tooltip
            permanent
            direction="center"
            className="zone-count-tooltip"
          >
            {marker.wardCount}
          </Tooltip>
        </CircleMarker>
      ))}
    </>
  );
}