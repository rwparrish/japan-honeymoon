import { useState, useCallback } from 'react';
import type { MapRef } from 'react-map-gl';
import type { Location } from '@/components/map/data/locations';

export interface JourneyAnimationProps {
  mapRef: React.RefObject<MapRef>;
  japanLocations: Location[];
  mapboxCenter: [number, number];
  mapboxZoom: number;
  TRANSITIONS: number;
}

export function useJourneyAnimation({
  mapRef,
  japanLocations,
  mapboxCenter,
  mapboxZoom,
  TRANSITIONS
}: JourneyAnimationProps) {
  const [currentPOIIndex, setCurrentPOIIndex] = useState(-1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const moveToNextLocation = useCallback(
    (nextIndex: number) => {
      if (!mapRef.current) return;

      const nextLocation = japanLocations[nextIndex];
      mapRef.current.flyTo({
        center: nextLocation.coordinates,
        zoom: 12,
        duration: 3000,
        essential: true,
      });
      setCurrentPOIIndex(nextIndex);
      setIsTransitioning(false);
    },
    [mapRef, japanLocations]
  );

  const isJourneyComplete =
    currentPOIIndex === japanLocations.length - 1 && !isTransitioning;

  const buttonText =
    currentPOIIndex === -1
      ? 'Begin Journey'
      : isTransitioning
      ? 'Going to next location...'
      : isJourneyComplete
      ? 'Relive Journey'
      : 'Continue Journey';

  const handleJourneyClick = () => {
    if (!mapRef.current || isTransitioning) return;

    if (isJourneyComplete) {
      // Reset to start the journey again
      setCurrentPOIIndex(-1);
      setIsTransitioning(false);
      mapRef.current.flyTo({
        center: mapboxCenter,
        zoom: mapboxZoom,
        duration: TRANSITIONS,
        essential: true,
      });
      return;
    }

    if (currentPOIIndex === -1) {
      // Initial zoom to first POI
      const firstLocation = japanLocations[0];
      mapRef.current.flyTo({
        center: firstLocation.coordinates,
        zoom: 12,
        duration: TRANSITIONS,
        essential: true,
      });
      setCurrentPOIIndex(0);
    } else {
      setIsTransitioning(true);

      // 1. Zoom out
      mapRef.current.flyTo({
        center: mapboxCenter,
        zoom: mapboxZoom,
        duration: TRANSITIONS,
        essential: true,
      });

      // 2. Move to next location without animating the line
      setTimeout(() => {
        const nextIndex = currentPOIIndex + 1;
        if (nextIndex < japanLocations.length) {
          moveToNextLocation(nextIndex);
        }
      }, TRANSITIONS);
    }
  };

  return { handleJourneyClick, buttonText, currentPOIIndex, isTransitioning };
} 