import React, { useEffect, useMemo, useRef, useState } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useTrainComposition } from "../api/useTrainComposition";
import { TrainPopup } from "./TrainPopup";
import type { EnrichedTrain } from "../api/client";
import type {
  FeatureCollection,
  MultiLineString,
  Point,
  Feature,
} from "geojson";
import {
  computeHeading,
  snapToTrack,
  rectangleCorners,
} from "../utils/trackGeometry";
import { Polygon } from "react-leaflet";
import { destination } from "@turf/turf";

interface TrainMarkerProps {
  train: EnrichedTrain;
  trackGeoJson: FeatureCollection<MultiLineString> | null;
}

export const TrainMarker: React.FC<TrainMarkerProps> = ({
  train,
  trackGeoJson,
}) => {
  const markerRef = useRef<L.Marker>(null);
  const { details, fetchDetails } = useTrainComposition();
  const key = `${train.properties.departureDate}#${train.properties.trainNumber}`;

  const [snappedLatLng, setSnappedLatLng] = useState<[number, number] | null>(
    null
  );
  const [heading, setHeading] = useState<number | null>(null);
  const [clicked, setClicked] = useState(false);
  const [rectangleCoords, setRectangleCoords] = useState<[number, number][]>(
    []
  );
  const [wagonsPolygons, setWagonsPolygons] = useState<[number, number][][]>(
    []
  );

  const defaultLatLng: [number, number] = [
    train.geometry.coordinates[1],
    train.geometry.coordinates[0],
  ];

  const icon = useMemo(() => {
    let markerColor = "#ff0000";
    if (train.category === "Long-distance") {
      markerColor = "#0000ff";
    } else if (train.category === "Commuter") {
      markerColor = "#00ff00";
    }

    // once clicked and heading is known -> show a triangle arrow
    if (clicked && heading !== null) {
      const pixelWidth = 24;
      const pixelHeight = 36;
      const color = markerColor;

      return L.divIcon({
        className: "",
        iconSize: [pixelWidth, pixelHeight],
        iconAnchor: [pixelWidth / 2, pixelHeight], // bottom center of triangle
        html: `
          <div style="
            width: 0;
            height: 0;
            border-left: ${pixelWidth / 2}px solid transparent;
            border-right: ${pixelWidth / 2}px solid transparent;
            border-bottom: ${pixelHeight}px solid ${color};
            transform: rotate(${heading}deg);
            transform-origin: center bottom;
          "></div>
        `,
      });
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

    return L.divIcon({
      className: "my-custom-pin",
      iconAnchor: [0, size * 8],
      popupAnchor: [0, -size * 12],
      html: `<span style="${markerHtmlStyle}">
              <span style="${triangleStyle}"></span>
              <span style="${triangleBorderStyle}"></span>
            </span>`,
    });
  }, [train.category, heading, clicked]);

  // snap when marker is clicked
  useEffect(() => {
    if (!clicked || !trackGeoJson || !train.geometry.coordinates) return;

    const pt: Feature<Point> = {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: train.geometry.coordinates,
      },
      properties: {},
    };
    const snapped = snapToTrack(trackGeoJson, pt);
    const newLatLng: [number, number] = [
      snapped.geometry.coordinates[1],
      snapped.geometry.coordinates[0],
    ];

    // only update if the snapped coords actually changed
    if (
      !snappedLatLng ||
      snappedLatLng[0] !== newLatLng[0] ||
      snappedLatLng[1] !== newLatLng[1]
    ) {
      setSnappedLatLng(newLatLng);
    }

    if (train.lastGeometry) {
      let hd: number | null = null;
      const prevPt: Feature<Point> = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: train.lastGeometry.coordinates,
        },
        properties: {},
      };
      const snappedPrev = snapToTrack(trackGeoJson, prevPt);
      hd = computeHeading(snappedPrev, snapped);

      if (hd !== heading && hd !== 0) {
        // console.log(train)
        // console.log(hd)
        setHeading(hd);

        const halfLengthKm = 0.04;
        const halfWidthKm = 0.005;
        const wagonGapKm = 0.003;

        // 'Locomotive'
        const rect = rectangleCorners(snapped, hd, halfLengthKm, halfWidthKm);
        setRectangleCoords(rect);

        // Wagons
        const comp = details[key];
        if (comp?.journeySections?.[0]?.wagons) {
          const wagons = comp.journeySections[0].wagons;

          let cumulativeKm = -0.025;

          const polygons = wagons.map((w) => {
            const wagonLengthKm = w.length / 1000_00;
            // add a gap before this wagon
            cumulativeKm += wagonLengthKm * 3 + wagonGapKm * 2;

            // build a point feature advanced backwards along track
            // use turf.destination on snapped point with bearing+180
            const backCenter = destination(
              snapped as any,
              cumulativeKm,
              hd + 180,
              { units: "kilometers" }
            );
            // snap it to track.
            const snappedCenter = snapToTrack(trackGeoJson, backCenter as any);
            const corners = rectangleCorners(
              snappedCenter as any,
              hd,
              halfLengthKm,
              halfWidthKm
            );
            return corners;
          });
          setWagonsPolygons(polygons);
        }
      }
    }
  }, [
    clicked,
    trackGeoJson,
    train.geometry.coordinates,
    snappedLatLng,
    heading,
  ]);

  useEffect(() => {
    if (details[key] && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [details[key]]);

  return (
    <Marker
      ref={markerRef}
      position={snappedLatLng ?? defaultLatLng}
      eventHandlers={{
        click: () => {
          setClicked(true);
          fetchDetails(
            train.properties.departureDate,
            train.properties.trainNumber
          );
        },
      }}
      icon={icon}
    >
      {/* Debug for locomotive; */}
      {/* {rectangleCoords.length > 0 && (
        <Polygon
          positions={rectangleCoords.map(([lng, lat]) => [lat, lng])}
          pathOptions={{ color: "white", weight: 1, opacity: 1 }}
        />
      )} */}

      {/* one polygon per wagon */}
      {wagonsPolygons.map((corners, i) => (
        <Polygon
          key={i}
          positions={corners.map(([lng, lat]) => [lat, lng])}
          pathOptions={{
            color: "red",
            weight: 1,
            opacity: 1,
            fillColor: "white",
            fillOpacity: 0.7,
          }}
        />
      ))}

      <Popup autoPan={false}>
        <TrainPopup train={train} composition={details[key]} />
      </Popup>
    </Marker>
  );
};
