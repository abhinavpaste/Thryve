import { MapContainer, Pane, TileLayer } from "react-leaflet";
import { useEffect, useState } from "react";
import WardLayer from "./WardLayer";

export default function MapView() {
  const [wards, setWards] = useState(null);

  useEffect(() => {
    fetch("/data/wards.geojson")
      .then((res) => res.json())
      .then((data) => setWards(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <MapContainer
      center={[12.9716, 77.5946]}
      zoom={12}
      style={{ height: "100vh", width: "100%" }}
      className="map-theme"
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png" />

      <Pane name="ward-boundary-glow" style={{ zIndex: 430 }} />
      <Pane name="ward-polygons" style={{ zIndex: 440 }} />

      <WardLayer data={wards} />

      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png" />
    </MapContainer>
  );
}
