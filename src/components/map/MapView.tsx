"use client";

import { useState } from 'react';
import Map, { Source, Layer } from 'react-map-gl';
import '@/styles/components/map/map.css';
import { japanGeoJson } from './data/locations';

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
    const [journeyStarted, setJourneyStarted] = useState(false);

    if (!mapboxAccessToken) {
        return <div>Missing Mapbox access token</div>;
    }

    return (
        <div className="map-container">
            <Map
                reuseMaps
                initialViewState={{
                    longitude: mapboxCenter[0],
                    latitude: mapboxCenter[1],
                    zoom: mapboxZoom
                }}
                mapStyle={mapboxStyle}
                mapboxAccessToken={mapboxAccessToken}
            >
                {journeyStarted && (
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
                )}
            </Map>
            <button 
                onClick={() => setJourneyStarted(true)}
                className="journey-button"
                disabled={journeyStarted}
            >
                Begin Journey
            </button>
        </div>
    );
}