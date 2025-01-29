"use client";

import Map from 'react-map-gl';

interface MapViewProps {
    mapboxAccessToken?: string;  // Now optional
    mapboxStyle?: string;
    mapboxCenter?: [number, number];
    mapboxZoom?: number;
}

export default function MapView({
    mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    mapboxStyle = 'mapbox://styles/mapbox/streets-v12',
    mapboxCenter = [137.5, 36.5], // Center of Japan's main island
    mapboxZoom = 5.5, // Good zoom level to see mainland
}: MapViewProps) {
    return (
        <div style={{ width: '100%', height: '75vh' }}>
            <Map
                initialViewState={{
                    longitude: mapboxCenter[0],
                    latitude: mapboxCenter[1],
                    zoom: mapboxZoom
                }}
                mapStyle={mapboxStyle}
                mapboxAccessToken={mapboxAccessToken}
            />
        </div>
    );
}