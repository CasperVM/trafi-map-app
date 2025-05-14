import { nearestPointOnLine } from "@turf/nearest-point-on-line";
import { bearing, destination, distance } from "@turf/turf";
import type {
  Feature,
  Point,
  MultiLineString,
  FeatureCollection,
} from "geojson";

export function snapToTrack(
  tracks: FeatureCollection<MultiLineString>,
  pt: Feature<Point>
): Feature<Point> {
  let closestPoint: Feature<Point> | null = null;
  let minDist = Infinity;

  for (const feature of tracks.features) {
    const candidate = nearestPointOnLine(feature, pt as any);
    const dist = distance(pt, candidate);
    if (dist < minDist) {
      minDist = dist;
      closestPoint = candidate;
    }
  }

  return closestPoint!;
}

export function computeHeading(
  from: Feature<Point>,
  to: Feature<Point>
): number {
  // TODO: use snapToTrack?
  return bearing(from, to);
}

//WIP.
export function rectangleCorners(
  center: Feature<Point>,
  heading: number,
  halfLengthKm: number,
  halfWidthKm: number
): [number, number][] {
  const front = destination(center, halfLengthKm, heading, {
    units: "kilometers",
  });
  const back = destination(center, halfLengthKm, heading + 180, {
    units: "kilometers",
  });

  const fl = destination(front, halfWidthKm, heading - 90, {
    units: "kilometers",
  });
  const fr = destination(front, halfWidthKm, heading + 90, {
    units: "kilometers",
  });
  const br = destination(back, halfWidthKm, heading + 90, {
    units: "kilometers",
  });
  const bl = destination(back, halfWidthKm, heading - 90, {
    units: "kilometers",
  });

  return [
    fl.geometry.coordinates,
    fr.geometry.coordinates,
    br.geometry.coordinates,
    bl.geometry.coordinates,
  ];
}
