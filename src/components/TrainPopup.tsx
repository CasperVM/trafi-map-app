import React from "react";

import type { EnrichedTrain, Composition } from "../api/client";
import { Popup } from "react-leaflet";

interface TrainPopupProps {
  train: EnrichedTrain;
  composition?: Composition;
}

export const TrainPopup: React.FC<TrainPopupProps> = ({
  train,
  composition,
}) => {
  const section = composition?.journeySections?.[0];
  const locomotives = section?.locomotives ?? [];
  const wagons = section?.wagons ?? [];

  const hasRestaurant = wagons.some((w) => w.catering);
  const hasPlayground = wagons.some((w) => w.playground);
  const hasPet = wagons.some((w) => w.pet);

  return (
    <Popup>
      <div>
        <strong>Train #{train.properties.trainNumber}</strong>
        <br />
        Category: {train.category}
        <br />
        Time: {new Date(train.properties.timestamp).toLocaleString()}
        <br />
        {train.properties.speed != null && (
          <>
            Speed: {train.properties.speed} km/h
            <br />
          </>
        )}
        {composition && (
          <>
            <hr className="my-1" />
            <strong>Type:</strong> {composition.trainType}
            <br />
            <strong>Locomotives:</strong> {locomotives.length}
            <br />
            <strong>Wagons:</strong> {wagons.length}
            <br />
            {hasRestaurant && (
              <>
                🍽️ Restaurant available
                <br />
              </>
            )}
            {hasPlayground && (
              <>
                🧸 Playground available
                <br />
              </>
            )}
            {hasPet && (
              <>
                🐾 Pet section available
                <br />
              </>
            )}
          </>
        )}
      </div>
    </Popup>
  );
};
