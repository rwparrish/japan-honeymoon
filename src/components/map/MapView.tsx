"use client";

import 'mapbox-gl/dist/mapbox-gl.css';
import { useRef } from 'react';
import Map, { MapRef, Source, Layer } from 'react-map-gl';
import '@/styles/components/map/map.css';
import { japanLocations } from './data/locations';
import { useJourneyAnimation } from '@/hooks/useJourneyAnimation';

interface MapViewProps {
    mapboxAccessToken?: string;
    mapboxStyle?: string;
    mapboxCenter?: [number, number];
    mapboxZoom?: number;
}

const TRANSITIONS = 2400;

export default function MapView({
    mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!,
    mapboxStyle = 'mapbox://styles/mapbox/satellite-streets-v12',
    mapboxCenter = [137.5, 36.5],
    mapboxZoom = 5.5,
}: MapViewProps) {
    const mapRef = useRef<MapRef>(null!);

    // Use the custom hook to manage journey animations
    const { handleJourneyClick, buttonText, currentPOIIndex, isTransitioning } = useJourneyAnimation({
        mapRef,
        japanLocations,
        mapboxCenter,
        mapboxZoom,
        TRANSITIONS
    });

    if (!mapboxAccessToken) {
        return <div>Missing Mapbox access token</div>;
    }

    // Computes the route coordinates based on visited locations.
    let routeCoordinates: Array<[number, number]> = [];
    if (currentPOIIndex >= 0) {
        // Get coordinates for all visited locations.
        routeCoordinates = japanLocations
            .slice(0, currentPOIIndex + 1)
            .map((loc) => loc.coordinates);
        const nextIndex = currentPOIIndex + 1;
        // If transitioning, include the next location to immediately show the connecting line.
        if (isTransitioning && nextIndex < japanLocations.length) {
            routeCoordinates.push(japanLocations[nextIndex].coordinates);
        }
    }

    // Build the GeoJSON feature for the route.
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
                >
                    {/* Render the route when there are at least two points */}
                    {routeCoordinates.length > 1 && (
                        <Source id="route" type="geojson" data={routeGeoJson}>
                            <Layer
                                id="route-layer"
                                type="line"
                                paint={{
                                    'line-color': '#FF0000',
                                    'line-width': 4,
                                    'line-opacity': 0.8,
                                }}
                            />
                        </Source>
                    )}
                </Map>
            </div>
        </div>
    );
}