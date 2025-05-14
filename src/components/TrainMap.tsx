import React, { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import type { EnrichedTrain } from "../api/client";
import { TrainMarker } from "./TrainMarker";
// import { TrackLines } from "./TrackLines";
import L from "leaflet";
import { TrackLinesAsVectorGridLayer } from "./TrackLinesAsVectorGridLayer";
import { useTrackLocations } from "../api/useTrackLocations";
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
  const { data: tracks, isLoading } = useTrackLocations();
  const visible = trains.filter((t) =>
    filter === "All" ? true : t.category === filter
  );

  if (isLoading || !tracks) return <div>Loading map...</div>;

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
      <TrackLinesAsVectorGridLayer trackGeoJson={tracks} />

      {visible.map((t) => (
        <TrainMarker
          key={`${t.properties.departureDate}#${t.properties.trainNumber}`}
          train={t}
          trackGeoJson={tracks}
        />
      ))}
    </MapContainer>
    // <VectorGridGeoJsonDemo/>
  );
};
