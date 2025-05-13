import React, { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.vectorgrid"; // registers L.vectorGrid.*
import rawGeoJson from "../data/eu-countries.json";

export const VectorGridGeoJsonLayer: React.FC = () => {
  const map = useMap();

  useEffect(() => {
    // 1) Clone & strip out the CRS so Leaflet assumes EPSG:4326 :contentReference[oaicite:0]{index=0}
    const geojson = JSON.parse(JSON.stringify(rawGeoJson));
    delete (geojson as any).crs;

    // 2) Create the VectorGrid.Slicer w/ Canvas renderer :contentReference[oaicite:1]{index=1}
    const vectorGridLayer: L.VectorGrid.Slicer = (L as any).vectorGrid.slicer(
      geojson,
      {
        rendererFactory: L.canvas.tile, // Canvas gives one draw‐call per tile :contentReference[oaicite:2]{index=2}
        interactive: true, // enable hover/click events :contentReference[oaicite:3]{index=3}
        vectorTileLayerStyles: {
          // “sliced” is the default layerName for slicer :contentReference[oaicite:4]{index=4}
          sliced: (props: any) => ({
            stroke: true, // draw the line itself
            weight: 3, // 3px wide
            color: "red", // red line
            fill: false, // no polygon fill
            fillColor: ["#800026", "#E31A1C", "#FEB24C", "#B2FE4C", "#FFEDA0"][
              props.mapcolor7 % 5
            ],
            fillOpacity: 0.5,
          }),
        },
        getFeatureId: (f: any) => f.properties.wb_a3, // stable feature IDs :contentReference[oaicite:5]{index=5}
      }
    );

    // 3) Optional: highlight on hover just like the demo
    vectorGridLayer.on("mouseover", (e: any) => {
      const props = e.layer.properties;
      L.popup()
        .setLatLng(e.latlng)
        .setContent(props.name || props.type)
        .openOn(map);
      vectorGridLayer.setFeatureStyle(props.wb_a3, {
        color: "red",
        weight: 2,
        fillOpacity: 1,
      });
    });
    vectorGridLayer.on("mouseout", () => {
      vectorGridLayer.resetFeatureStyle();
    });

    // 4) Add + force a redraw
    vectorGridLayer.addTo(map);
    map.once("load", () => map.invalidateSize()); // ensure canvas sized correctly

    // 5) Clean up
    return () => {
      map.removeLayer(vectorGridLayer);
    };
  }, [map]);

  return null;
};

export const VectorGridGeoJsonDemo: React.FC = () => (
  <MapContainer
    center={[47.04, 9.67]}
    zoom={5}
    style={{ width: "100%", height: "100vh" }}
    preferCanvas
  >
    <TileLayer
      url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png"
      attribution="&copy; OpenStreetMap contributors, &copy; CartoDB"
    />
    <VectorGridGeoJsonLayer />
  </MapContainer>
);
