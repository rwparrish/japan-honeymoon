export interface Photo {
    url: string;
    lat: number;
    lng: number;
    caption?: string;
    takenAt?: string;
}

export interface Location {
    id: number;
    name: string;
    coordinates: [number, number]; // [longitude, latitude]
    dates: string;
    description?: string;
    photos?: Photo[];
}

export interface JapanGeoJSON {
    type: "FeatureCollection";
    features: Array<{
        type: "Feature";
        geometry: {
            type: "Point";
            coordinates: [number, number];
        };
        properties: {
            id: number;
            name: string;
            dates: string;
            description?: string;
        };
    }>;
}

export const japanLocations: Location[] = [
    {
        id: 1,
        name: "Tokyo",
        coordinates: [139.7690, 35.6804],
        dates: "11/27/24 - 11/30/24",
        description: "Starting point of our journey",
        photos: [
            {
                url: "/photos/tokyo/shibuya.jpg",
                lat: 139.7015,
                lng: 35.6580,
                caption: "Shibuya Crossing",
                takenAt: "2024-11-28"
            },
            // ... more photos
        ]
    },
    {
        id: 2,
        name: "Kanazawa",
        coordinates: [136.6503, 36.5611],
        dates: "11/30/24 - 12/2/24",
        description: "Historic castle town known for gardens and samurai districts"
    },
    {
        id: 3,
        name: "Shirakawa-go",
        coordinates: [136.9098, 36.2568],
        dates: "12/2/24",
        description: "UNESCO World Heritage site famous for traditional gassho-zukuri farmhouses"
    },
    {
        id: 4,
        name: "Takayama",
        coordinates: [137.2520, 36.1408],
        dates: "12/2/24 - 12/4/24",
        description: "Beautiful old town in the Japanese Alps"
    },
    {
        id: 5,
        name: "Kyoto",
        coordinates: [135.7681, 35.0116],
        dates: "12/4/24 - 12/7/24",
        description: "Japan's cultural heart with numerous temples and gardens"
    },
    {
        id: 6,
        name: "Osaka",
        coordinates: [135.5023, 34.6937],
        dates: "12/7/24 - 12/9/24",
        description: "Known for its amazing food and vibrant atmosphere"
    },
    {
        id: 7,
        name: "Hakone",
        coordinates: [139.0511, 35.2324],
        dates: "12/9/24 - 12/11/24",
        description: "Hot spring resort town with views of Mt. Fuji"
    },
    {
        id: 8,
        name: "Tokyo",
        coordinates: [139.7690, 35.6804],
        dates: "12/11/24 - 12/12/24",
        description: "Final stop before departure"
    }
]; 

export const japanGeoJson: JapanGeoJSON = {
    type: "FeatureCollection",
    features: japanLocations.map(location => ({
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: location.coordinates
        },
        properties: {
            id: location.id,
            name: location.name,
            dates: location.dates,
            description: location.description
        }
    }))
} as const; 