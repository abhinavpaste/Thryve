import { MapContainer, Pane, TileLayer } from "react-leaflet";
import { useEffect, useMemo, useState } from "react";
import WardLayer from "./WardLayer";
import { buildMergedWards } from "./wardAggregation";

export default function MapView({ onZoneClick }){
  const [wards, setWards] = useState(null);

  useEffect(() => {
    fetch("/data/wards.geojson")
      .then((res) => res.json())
      .then((data) => setWards(data))
      .catch((err) => console.error(err));
  }, []);

  const { zones, markers } = useMemo(() => buildMergedWards(wards, 22), [wards]);
console.log("onZoneClick:", onZoneClick);
  return (
    <MapContainer
      center={[12.9716, 77.5946]}
      zoom={12}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png" />

      <Pane name="chunk-boundary-glow" style={{ zIndex: 430 }} />
      <Pane name="chunk-polygons" style={{ zIndex: 440 }} />
      <Pane name="chunk-markers" style={{ zIndex: 460 }} />

      <WardLayer
  data={zones}
  markers={markers}
  onZoneClick={onZoneClick}
/>

      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png" />
    </MapContainer>
  );
}
