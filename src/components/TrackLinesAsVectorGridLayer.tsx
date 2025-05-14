import React, { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.vectorgrid";
import type { FeatureCollection, MultiLineString } from "geojson";
interface TrackLinesProps {
  trackGeoJson: FeatureCollection<MultiLineString> | null;
}

export const TrackLinesAsVectorGridLayer: React.FC<TrackLinesProps> = ({trackGeoJson}) => {
  const map = useMap();

  useEffect(() => {
    if (!trackGeoJson) return;

    const layer = (L as any).vectorGrid.slicer(trackGeoJson, {
      rendererFactory: L.canvas.tile,
      interactive: true,
      getFeatureId: (f: any) => f.properties?.tunniste,
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

    return () => {
      map.removeLayer(layer);
    };
  }, [map, trackGeoJson]);

  return null;
};
