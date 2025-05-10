import type { EnrichedTrain } from './client';
import { useTrainLocations } from './useTrainLocations';
import { useTrainMetadata } from './useTrainMetadata';
import { useMemo } from 'react';

export function useEnrichedTrainLocations() {
  const { categoryMap } = useTrainMetadata();
  const trains = useTrainLocations(categoryMap);

  const enriched = useMemo(() => {
    return Object.values(trains).map(t => {
      const id = `${t.properties.departureDate}#${t.properties.trainNumber}`;
      return {
        ...t,
        category: categoryMap?.[id] ?? 'Other'
      } as EnrichedTrain;
    });
  }, [trains, categoryMap]);

  return enriched;
}