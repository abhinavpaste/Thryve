import { CircleMarker, GeoJSON, Tooltip } from "react-leaflet";

function styleFeature() {
  return {
    fillColor: "#1f3f82",
    fillOpacity: 0.12,
    color: "transparent",
    weight: 0,
    opacity: 0,
  };
}

function styleBoundary() {
  return {
    color: "#81b9ff",
    weight: 2.1,
    opacity: 0.85,
  };
}

function onEachFeature(feature, layer) {
  const properties = feature.properties || {};
  const wardNames = (properties.ward_names || []).slice(0, 7).join(", ");
  const overflow = (properties.ward_names || []).length > 7 ? "…" : "";

  layer.bindPopup(`
    <div style="min-width: 240px; font-family: Inter, system-ui, sans-serif;">
      <h4 style="margin: 0 0 8px;">${properties.zone_name || "Zone"}</h4>
      <div><strong>Wards merged:</strong> ${properties.ward_count || 0}</div>
      <div style="margin-top: 6px;"><strong>Includes:</strong> ${wardNames}${overflow}</div>
    </div>
  `);

  layer.on({
    mouseover: (e) => {
      e.target.setStyle({
        fillOpacity: 0.2,
      });
    },
    mouseout: (e) => {
      e.target.setStyle({
        fillOpacity: 0.12,
      });
    },
    click: () => {
      console.log("Merged ward zone:", properties);
    },
  });
}

export default function WardLayer({ data, boundaries, markers }) {
  if (!data) {
    return null;
  }

  return (
    <>
      <GeoJSON data={data} style={styleFeature} onEachFeature={onEachFeature} />
      {boundaries && <GeoJSON data={boundaries} style={styleBoundary} interactive={false} />}

      {markers.map((marker) => (
        <CircleMarker
          key={marker.zoneId}
          center={marker.center}
          radius={16}
          pathOptions={{
            color: "#66a7ff",
            fillColor: "#142f60",
            fillOpacity: 0.7,
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
