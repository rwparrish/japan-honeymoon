"use client";

import { useState } from 'react';
import Map from 'react-map-gl';
import '@/styles/components/map/map.css';

interface MapViewProps {
    mapboxAccessToken?: string;
    mapboxStyle?: string;
    mapboxCenter?: [number, number];
    mapboxZoom?: number;
}

export default function MapView({
    mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    mapboxStyle = 'mapbox://styles/mapbox/streets-v12',
    mapboxCenter = [137.5, 36.5],
    mapboxZoom = 5.5,
}: MapViewProps) {
    const [journeyStarted, setJourneyStarted] = useState(false);

    return (
        <div className="map-container">
            <Map
                initialViewState={{
                    longitude: mapboxCenter[0],
                    latitude: mapboxCenter[1],
                    zoom: mapboxZoom
                }}
                mapStyle={mapboxStyle}
                mapboxAccessToken={mapboxAccessToken}
            />
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