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
    const mapRef = useRef<MapRef>(null);

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
    }, []);

    const handleJourneyClick = () => {
        if (!mapRef.current || isTransitioning) return;

        if (currentPOIIndex === -1) {
            // Initial zoom to first POI
            const firstLocation = japanLocations[0];
            mapRef.current.flyTo({
                center: firstLocation.coordinates,
                zoom: 12,
                duration: 3000,
                essential: true
            });
            setCurrentPOIIndex(0);
        } else {
            // Start transition sequence
            setIsTransitioning(true);
            
            // 1. Zoom out
            mapRef.current.flyTo({
                center: mapboxCenter,
                zoom: mapboxZoom,
                duration: 2000,
                essential: true
            });

            // 2. Wait for zoom out + show train route, then go to next location
            setTimeout(() => {
                const nextIndex = currentPOIIndex + 1;
                if (nextIndex < japanLocations.length) {
                    moveToNextLocation(nextIndex);
                }
            }, 4000); // 2s for zoom out + 2s for train route animation
        }
    };

    const buttonText = currentPOIIndex === -1 
        ? "Begin Journey" 
        : isTransitioning 
            ? "Going to next location..." 
            : "Continue Journey";

    const isJourneyComplete = currentPOIIndex >= japanLocations.length - 1;

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
                    onMouseEnter={(event) => {
                        const features = event.features || [];
                        const hoveredLocation = features[0];
                        
                        if (hoveredLocation) {
                            const locationData = japanLocations.find(
                                loc => loc.id === hoveredLocation?.properties?.id
                            );
                            if (locationData) {
                                setSelectedLocation(locationData);
                            }
                        }
                    }}
                    onMouseLeave={() => {
                        setSelectedLocation(null);
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
                </Map>
                
                <LocationModal 
                    location={selectedLocation}
                    onClose={() => setSelectedLocation(null)}
                />
            </div>
        </div>
    );
}