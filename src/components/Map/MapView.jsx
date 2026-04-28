import { MapContainer, TileLayer } from "react-leaflet";
import { useEffect, useState } from "react";
import WardLayer from "./WardLayer";

export default function MapView() {
  const [wards, setWards] = useState(null);

  useEffect(() => {
    fetch("/data/wards.geojson")
      .then((res) => {
        console.log("status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("geojson loaded:", data);
        setWards(data);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <MapContainer
      center={[12.9716, 77.5946]}
      zoom={12}
      style={{ height: "100vh", width: "100%" }}
    >
    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png" />

  {/* Ward polygons */}
  <WardLayer data={wards} />

  {/* Labels ON TOP */}
  <TileLayer url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png" />
    </MapContainer>
  );
}