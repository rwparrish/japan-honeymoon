"use client";

import { useState, useRef, useCallback } from 'react';
import Map, { Source, Layer, MapRef } from 'react-map-gl';
import '@/styles/components/map/map.css';
import { japanGeoJson, japanLocations, Location } from './data/locations';
import LocationModal from '@/components/map/LocationModal';

interface MapViewProps {
    mapboxAccessToken: string;
    mapboxStyle?: string;
    mapboxCenter?: [number, number];
    mapboxZoom?: number;
}

export default function MapView({
    mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!,
    mapboxStyle = 'mapbox://styles/mapbox/streets-v12',
    mapboxCenter = [137.5, 36.5],
    mapboxZoom = 5.5,
}: MapViewProps) {
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [currentPOIIndex, setCurrentPOIIndex] = useState(-1);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [routeProgress, setRouteProgress] = useState(0);
    const animationFrameRef = useRef<number | null>(null);
    const mapRef = useRef<MapRef>(null);

    const getRouteData = (from: Location, to: Location) => {
        // Calculate a control point above the midpoint for the arch
        const mid = [
            (from.coordinates[0] + to.coordinates[0]) / 2,
            (from.coordinates[1] + to.coordinates[1]) / 2
        ];
        
        // Calculate distance between points to determine arch height
        const dist = Math.sqrt(
            Math.pow(to.coordinates[0] - from.coordinates[0], 2) +
            Math.pow(to.coordinates[1] - from.coordinates[1], 2)
        );
        
        // Increased multiplier from 0.3 to 0.8 for a higher arch
        const controlPoint = [
            mid[0],
            mid[1] + (dist * 0.6) // Higher arch
        ];

        // Generate curve points
        const curvePoints = [];
        for (let t = 0; t <= 1; t += 0.01) {
            const point = [
                Math.pow(1-t, 2) * from.coordinates[0] + 
                2 * (1-t) * t * controlPoint[0] + 
                Math.pow(t, 2) * to.coordinates[0],
                Math.pow(1-t, 2) * from.coordinates[1] + 
                2 * (1-t) * t * controlPoint[1] + 
                Math.pow(t, 2) * to.coordinates[1]
            ];
            curvePoints.push(point as [number, number]);
        }

        return {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: curvePoints
            }
        };
    };

    const moveToNextLocation = useCallback((nextIndex: number) => {
        if (!mapRef.current) return;
        
        const nextLocation = japanLocations[nextIndex];
        mapRef.current.flyTo({
            center: nextLocation.coordinates,
            zoom: 12,
            duration: 3000,
            essential: true
        });
        setCurrentPOIIndex(nextIndex);
        setIsTransitioning(false);
        setRouteProgress(0);
    }, []);

    const animateRoute = useCallback((startTime: number, duration: number) => {
        const frame = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            setRouteProgress(progress);

            if (progress < 1) {
                animationFrameRef.current = requestAnimationFrame(frame);
            } else {
                // Animation complete, move to next location
                const nextIndex = currentPOIIndex + 1;
                if (nextIndex < japanLocations.length) {
                    moveToNextLocation(nextIndex);
                }
            }
        };

        animationFrameRef.current = requestAnimationFrame(frame);
    }, [currentPOIIndex, moveToNextLocation]);

    const handleJourneyClick = () => {
        if (!mapRef.current || isTransitioning) return;

        // Cancel any existing animation
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        if (currentPOIIndex === -1) {
            // Initial zoom to first POI
            const firstLocation = japanLocations[0];
            mapRef.current.flyTo({
                center: firstLocation.coordinates,
                zoom: 12,
                duration: 2400,
                essential: true
            });
            setCurrentPOIIndex(0);
        } else {
            setIsTransitioning(true);
            
            // 1. Zoom out
            mapRef.current.flyTo({
                center: mapboxCenter,
                zoom: mapboxZoom,
                duration: 1400,
                essential: true
            });

            // 2. Start route animation after zoom out
            setTimeout(() => {
                animateRoute(performance.now(), 1400);
            }, 1400);
        }
    };

    // Cleanup animation on unmount
    useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
    }, []);

    const buttonText = currentPOIIndex === -1 
        ? "Begin Journey" 
        : isTransitioning 
            ? "Going to next location..." 
            : "Continue Journey";

    const isJourneyComplete = currentPOIIndex >= japanLocations.length - 1;

    const currentRoute = isTransitioning && currentPOIIndex < japanLocations.length - 1
        ? getRouteData(
            japanLocations[currentPOIIndex],
            japanLocations[currentPOIIndex + 1]
          )
        : null;

    if (!mapboxAccessToken) {
        return <div>Missing Mapbox access token</div>;
    }

    return (
        <div className="relative">
            <button 
                onClick={handleJourneyClick}
                className="journey-button-top"
                disabled={isJourneyComplete || isTransitioning}
            >
                {buttonText}
            </button>
            
            <div className="map-container">
                <Map
                    ref={mapRef}
                    reuseMaps
                    initialViewState={{
                        longitude: mapboxCenter[0],
                        latitude: mapboxCenter[1],
                        zoom: mapboxZoom
                    }}
                    mapStyle={mapboxStyle}
                    mapboxAccessToken={mapboxAccessToken}
                    onClick={(event) => {
                        const features = event.features || [];
                        const clickedLocation = features[0];
                        
                        if (clickedLocation) {
                            const locationData = japanLocations.find(
                                loc => loc.id === clickedLocation?.properties?.id
                            );
                            if (locationData) {
                                setSelectedLocation(locationData);
                            }
                        }
                    }}
                    interactiveLayerIds={['points']}
                    cursor={selectedLocation ? 'pointer' : 'default'}
                >
                    <Source type="geojson" data={japanGeoJson}>
                        <Layer
                            id="points"
                            type="circle"
                            paint={{
                                'circle-radius': 8,
                                'circle-color': '#ff0000',
                                'circle-stroke-width': 2,
                                'circle-stroke-color': '#ffffff'
                            }}
                        />
                    </Source>

                    {currentRoute && (
                        <Source
                            type="geojson"
                            data={currentRoute}
                            lineMetrics={true}
                        >
                            <Layer
                                id="route"
                                type="line"
                                paint={{
                                    'line-color': '#FF0000',
                                    'line-width': 3,
                                    'line-dasharray': [2, 1],
                                    'line-opacity': routeProgress
                                }}
                                layout={{
                                    'line-cap': 'round',
                                    'line-join': 'round'
                                }}
                            />
                        </Source>
                    )}
                </Map>
                
                <LocationModal 
                    location={selectedLocation}
                    onClose={() => setSelectedLocation(null)}
                />
            </div>
        </div>
    );
}