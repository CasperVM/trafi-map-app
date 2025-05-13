// VectorGridLayer.tsx
import React, { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.vectorgrid";
import { fromEtrsToWgs84Simplified } from "../utils/transform";

const TRACKS_URL =
  "https://rata.digitraffic.fi/infra-api/0.8/14817/raiteet.geojson?" +
  "propertyName=geometria,kuvaus,sahkoistetty,tunnus,tunniste&" +
  "time=2025-05-13T09:00:00Z/2025-05-13T09:00:00Z";

async function fetchAndReprojectTracks(): Promise<GeoJSON.FeatureCollection> {
  const res = await fetch(TRACKS_URL);
  const raw: GeoJSON.FeatureCollection = await res.json();

  return {
    type: "FeatureCollection",
    features: raw.features
      //   .filter(f => f.properties?.sahkoistetty)
      .map((f) => ({
        type: "Feature",
        geometry: {
          type: "MultiLineString",
          coordinates: (f.geometry.coordinates as number[][][]).map((line) =>
            fromEtrsToWgs84Simplified(line as [number, number][])
          ),
        },
        properties: f.properties,
      })),
  };
}

export const VectorGridLayer: React.FC = () => {
  const map = useMap();

  useEffect(() => {
    let layer: L.VectorGrid.Slicer;

    fetchAndReprojectTracks().then((fc) => {
      layer = (L as any).vectorGrid.slicer(fc, {
        rendererFactory: L.canvas.tile,
        interactive: true,
        getFeatureId: (f) => f.properties.tunniste,
        maxZoom: 24,
        maxNativeZoom: 24,
        vectorTileLayerStyles: {
          sliced: {
            stroke: true,
            weight: 3,
            color: "red",
            fill: false,
          },
        },
      });

      layer.addTo(map);
      map.once("load", () => map.invalidateSize());
    });

    return () => {
      if (layer) map.removeLayer(layer);
    };
  }, [map]);

  return null;
};
