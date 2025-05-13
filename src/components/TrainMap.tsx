import React, { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import type { EnrichedTrain } from "../api/client";
import { TrainMarker } from "./TrainMarker";
// import { TrackLines } from "./TrackLines";
import L from "leaflet";
import { VectorGridLayer } from "./VectorGridLayer";
// import { VectorGridGeoJsonDemo, VectorGridGeoJsonLayer } from "./VectorGridGeoJsonDemo";
interface TrainMapProps {
  trains: EnrichedTrain[];
  filter: "All" | "Commuter" | "Long-distance" | "Other";
}

const InvalidateOnMount = () => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
};

export const TrainMap: React.FC<TrainMapProps> = ({ trains, filter }) => {
  const visible = trains.filter((t) =>
    filter === "All" ? true : t.category === filter
  );

  return (
    <MapContainer
      center={[61.9241, 25.7482]}
      zoom={6}
      maxZoom={19}
      className="flex-1"
      preferCanvas={true}
      renderer={L.canvas()}
    >
      <InvalidateOnMount />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
        maxZoom={19}
      />
      {/* <TrackLines /> */}
      <VectorGridLayer />

      {visible.map((t) => (
        <TrainMarker
          key={`${t.properties.departureDate}#${t.properties.trainNumber}`}
          train={t}
        />
      ))}
    </MapContainer>
    // <VectorGridGeoJsonDemo/>
  );
};
