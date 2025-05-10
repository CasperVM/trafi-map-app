import React, { useEffect, useMemo, useRef } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useTrainComposition } from "../api/useTrainComposition";
import { TrainPopup } from "./TrainPopup";
import type { EnrichedTrain } from "../api/client";

interface TrainMarkerProps {
  train: EnrichedTrain;
}

export const TrainMarker: React.FC<TrainMarkerProps> = ({ train }) => {
  const markerRef = useRef<L.Marker>(null);
  const { details, fetchDetails } = useTrainComposition();
  const key = `${train.properties.departureDate}#${train.properties.trainNumber}`;

  const icon = useMemo(() => {
    let markerColor = "#ff0000";
    if (train.category === "Long-distance") {
      markerColor = "#0000ff"
    } else if (train.category === "Commuter") {
      markerColor = "#00ff00"
    }
    const size = 1.5;
    const halfSize = size / 2;

    const markerHtmlStyles = `
      background-color: ${markerColor};
      width: ${size}em;
      height: ${size}em;
      display: block;
      left: -${halfSize}em;
      top: -${halfSize}em;
      position: relative;
      border-radius: 50%;
      border: 1px solid white;
    `;

    return L.divIcon({
      className: "my-custom-pin",
      iconAnchor: [0, size * 8],
      popupAnchor: [0, -size * 12],
      html: `<span style="${markerHtmlStyles}" />`,
    });
  }, []);

  useEffect(() => {
    if (details[key] && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [details[key]]);

  return (
    <Marker
      ref={markerRef}
      position={[
        train.geometry.coordinates[1],
        train.geometry.coordinates[0],
      ]}
      eventHandlers={{
        click: () =>
          fetchDetails(
            train.properties.departureDate,
            train.properties.trainNumber
          ),
      }}
      icon={icon}
    >
      <Popup autoPan={false}>
        <TrainPopup train={train} composition={details[key]} />
      </Popup>
    </Marker>
  );
};
