import proj4 from "proj4";
import simplify from "simplify-js";

proj4.defs("EPSG:3067", "+proj=utm +zone=35 +ellps=GRS80 +units=m +no_defs");

export function fromEtrsToWgs84([x, y]: [number, number]): [number, number] {
  const [lon, lat] = proj4("EPSG:3067", "EPSG:4326", [x, y]) as [
    number,
    number
  ];
  return [lat, lon];
}

export function fromEtrsToWgs84Simplified(
  line: [number, number][]
): [number, number][] {
  // Simplify the tracks and reduce resolution
  return toLatLngs(simplify(toPoints(line.map(fromEtrsToWgs84)), 0.0002));
}

export const toPoints = (coords: [number, number][]) =>
  coords.map(([lat, lng]) => ({ x: lat, y: lng }));

export const toLatLngs = (points: { x: number; y: number }[]) =>
  points.map(({ x, y }) => [x, y] as [number, number]);

/////
export function testCoords() {
  const coords3067 = [302419.0028, 6869674.9937];
  const coordsWGS84 = proj4("EPSG:3067", "EPSG:4326", coords3067);
  return [coordsWGS84[1], coordsWGS84[0]];
}
