"use client";

import 'mapbox-gl/dist/mapbox-gl.css';
import { useState, useRef } from 'react';
import Map, { MapRef, Source, Layer } from 'react-map-gl';
import '@/styles/components/map/map.css';
import { japanLocations } from './data/locations';
import LocationModal from '@/components/map/LocationModal';
import { useJourneyAnimation } from '@/hooks/useJourneyAnimation';

interface MapViewProps {
    mapboxAccessToken?: string;
    mapboxStyle?: string;
    mapboxCenter?: [number, number];
    mapboxZoom?: number;
}

const LONG_TRANSITION_MS = 2400;  // For major transitions
const SHORT_TRANSITION_MS = 2400; // For intermediate transitions

export default function MapView({
    mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!,
    mapboxStyle = 'mapbox://styles/mapbox/satellite-streets-v12',
    mapboxCenter = [137.5, 36.5],
    mapboxZoom = 5.5,
}: MapViewProps) {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const mapRef = useRef<MapRef>(null);

    // Use the custom hook to manage journey animations
    const { handleJourneyClick, buttonText, currentPOIIndex, isTransitioning } = useJourneyAnimation({
        mapRef,
        japanLocations,
        mapboxCenter,
        mapboxZoom,
        LONG_TRANSITION_MS,
        SHORT_TRANSITION_MS,
    });

    if (!mapboxAccessToken) {
        return <div>Missing Mapbox access token</div>;
    }

    // Compute route coordinates from visited points.
    // When transitioning, include the next destination to display the connecting line immediately.
    let routeCoordinates: Array<[number, number]> = [];
    if (currentPOIIndex >= 0) {
        // Coordinates for visited locations.
        routeCoordinates = japanLocations.slice(0, currentPOIIndex + 1).map(loc => loc.coordinates);
        // If transitioning, include the next planned POI.
        const nextIndex = currentPOIIndex + 1;
        if (isTransitioning && nextIndex < japanLocations.length) {
            routeCoordinates.push(japanLocations[nextIndex].coordinates);
        }
    }

    const routeGeoJson = {
        type: "Feature",
        geometry: {
            type: "LineString",
            coordinates: routeCoordinates,
        },
    };

    return (
        <div className="relative">
            <button 
                onClick={handleJourneyClick}
                className="journey-button-top"
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
                    minZoom={5}
                    maxZoom={15}
                    maxBounds={[
                        [125.619324, 27.839037],  // Southwest: tighter around Kyushu
                        [149.744277, 43.934476]   // Northeast: tighter around Hokkaido
                    ]}
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
                    {(currentPOIIndex >= 0 && routeCoordinates.length > 1) && (
                        <Source id="route" type="geojson" data={routeGeoJson}>
                            <Layer
                                id="route-layer"
                                type="line"
                                paint={{
                                    'line-color': '#FF0000',
                                    'line-width': 4,
                                    'line-dasharray': [2, 2],
                                    'line-opacity': 0.8,
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