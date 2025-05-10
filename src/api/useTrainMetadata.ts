import { useEffect, useMemo, useState } from 'react';
import { TODAY } from './client';

type TrainMetadata = {
  trainNumber: number;
  departureDate: string;
  trainCategory: string;
};

export function useTrainMetadata() {
  const [data, setData] = useState<TrainMetadata[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchMetadata = async () => {
      try {
        const res = await fetch(`https://rata.digitraffic.fi/api/v1/trains/${TODAY}`);
        if (!res.ok) throw new Error('Failed to fetch train metadata');
        const json: TrainMetadata[] = await res.json();
        if (isMounted) {
          setData(json);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          setLoading(false);
        }
      }
    };

    fetchMetadata();

    const interval = setInterval(fetchMetadata, 60_000); // Refresh every minute
    return () => {
      clearInterval(interval);
      isMounted = false;
    };
  }, []);

  const categoryMap = useMemo(() => {
    const m: Record<string, 'Commuter' | 'Long-distance' | 'Other'> = {};
    data?.forEach(train => {
      const cat = ['Commuter', 'Long-distance'].includes(train.trainCategory)
        ? (train.trainCategory as 'Commuter' | 'Long-distance')
        : 'Other';
      m[`${train.departureDate}#${train.trainNumber}`] = cat;
    });
    return m;
  }, [data]);

  return { categoryMap, isLoading: loading, error };
}
