import { useEffect, useState } from 'react';
import { fromEtrsToWgs84Simplified } from '../utils/transform';

type TrackFeature = GeoJSON.Feature<GeoJSON.MultiLineString, any>;

let cachedTracks: GeoJSON.FeatureCollection<GeoJSON.MultiLineString> | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 60 * 60 * 1000; // 60 minutes

export function useTrackLocations() {
  const [data, setData] = useState<typeof cachedTracks | null>(cachedTracks);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(!cachedTracks);

  useEffect(() => {
    let isMounted = true;
    const now = Date.now();

    const fetchTracks = async () => {
      const isoNow = new Date().toISOString().slice(0, 19);
      const url = `https://rata.digitraffic.fi/infra-api/0.8/14817/raiteet.geojson?` +
        `propertyName=geometria,kuvaus,sahkoistetty,tunnus,tunniste&time=${isoNow}Z/${isoNow}Z`;

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch track data');
        const raw: GeoJSON.FeatureCollection = await res.json();

        const reprojected: TrackFeature[] = raw.features.map((f) => ({
          type: "Feature",
          geometry: {
            type: "MultiLineString",
            coordinates: (f.geometry.coordinates as number[][][]).map((line) =>
              fromEtrsToWgs84Simplified(line as [number, number][])
            ),
          },
          properties: f.properties,
        }));

        const featureCollection: typeof cachedTracks = {
          type: "FeatureCollection",
          features: reprojected,
        };

        if (isMounted) {
          cachedTracks = featureCollection;
          lastFetchTime = now;
          setData(featureCollection);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          setLoading(false);
        }
      }
    };

    const isCacheValid = cachedTracks && now - lastFetchTime < CACHE_TTL;

    if (!isCacheValid) {
      fetchTracks();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, error, isLoading: loading };
}
