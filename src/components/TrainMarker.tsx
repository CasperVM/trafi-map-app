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
      markerColor = "#0000ff";
    } else if (train.category === "Commuter") {
      markerColor = "#00ff00";
    }
    const size = 3;
    const halfSize = size / 2;
    const triangleSideSize = size / 3.75;
    const triangleTopSize = size / 3;

    const markerHtmlStyle = `
      background-color: ${markerColor};
      width: ${size}em;
      height: ${size}em;
      display: block;
      left: -${halfSize}em;
      top: -${halfSize}em;
      position: relative;
      border-radius: 50%;
      border: 1px solid white;
      z-index:2;
    `;

    const triangleStyle = `
      position: absolute;
      bottom: -${triangleSideSize}em;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: ${triangleSideSize}em solid transparent;
      border-right: ${triangleSideSize}em solid transparent;
      border-top: ${triangleTopSize}em solid ${markerColor};
      z-index:1;
    `;

    const triangleBorderStyle = `
      position: absolute;
      bottom: -${triangleSideSize}em;
      left: 50%;
      transform: translateX(-50%) translateY(11%);
      width: 0;
      height: 0;
      border-left: ${triangleSideSize + 0.15}em solid transparent;
      border-right: ${triangleSideSize + 0.15}em solid transparent;
      border-top: ${triangleTopSize + 0.15}em solid white;
      z-index: 0;
    `;

    // <span style="${triangleStyles}"></span>
    return L.divIcon({
      className: "my-custom-pin",
      iconAnchor: [0, size * 8],
      popupAnchor: [0, -size * 12],
      html: ` <span style="${markerHtmlStyle}">    
              <span style="${triangleStyle}"></span>
              <span style="${triangleBorderStyle}"></span>
            </span>`,
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
      position={[train.geometry.coordinates[1], train.geometry.coordinates[0]]}
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
