import { useEffect, useState } from "react";
import { Polyline } from "react-leaflet";
import { fromEtrsToWgs84Simplified } from "../utils/transform";

interface TrackFeature {
  geometry: {
    type: "MultiLineString";
    coordinates: number[][][];
  };
  properties: {
    tunniste: string;
    tunnus: string;
    sahkoistetty: boolean;
  };
}

export const TrackLines = () => {
  const [tracks, setTracks] = useState<TrackFeature[]>([]);

  useEffect(() => {
    const fetchTracks = async () => {
      const res = await fetch(
        "https://rata.digitraffic.fi/infra-api/0.8/14817/raiteet.geojson?propertyName=geometria,kuvaus,sahkoistetty,tunnus,tunniste&time=2025-05-13T09:00:00Z/2025-05-13T09:00:00Z"
      );
      const data = await res.json();
      setTracks(data.features);
    };

    fetchTracks();
  }, []);

  return (
    <>
      {tracks
        .filter((feature) => feature.properties.sahkoistetty)
        .map((feature, idx) =>
          feature.geometry.coordinates.map((line, i) => (
            <Polyline
              key={`${feature.properties.tunniste}-${i}`}
              // positions={(line as [number, number][]).map(fromEtrsToWgs84)}
              positions={fromEtrsToWgs84Simplified(line as [number, number][])}
              pathOptions={{ color: "red", weight: 3 }}
            />
          ))
        )}
    </>
  );
};
