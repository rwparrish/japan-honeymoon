"use client";

import { useCallback } from 'react';
import { Location } from './data/locations';

interface LocationModalProps {
    location: Location | null;
    onClose: () => void;
}

export default function LocationModal({ location, onClose }: LocationModalProps) {
    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }, [onClose]);

    if (!location) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 md:p-6"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-4 md:p-6">
                    <div className="flex justify-between items-start">
                        <h2 className="text-xl md:text-2xl font-bold">{location.name}</h2>
                        <button 
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>
                    <p className="text-gray-600 mt-2">{location.dates}</p>
                    <p className="mt-4">{location.description}</p>
                    
                    {/* Placeholder for media gallery */}
                    <div className="mt-6">
                        <h3 className="font-semibold mb-3">Photos & Videos</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {/* Add your media components here */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 