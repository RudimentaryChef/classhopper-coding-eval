import React, { useState, useEffect } from 'react';

type SeatsDisplayProps = {
    seats: number;
    loading: boolean;
};

export default function SeatsDisplay({ seats, loading }: SeatsDisplayProps) {
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${loading ? 'bg-gray-100 text-gray-500' : seats > 5 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                transition-all duration-300 ease-in-out`}
        >
            {loading ? (
                <div className="flex items-center">
                    <div className="mr-1.5 flex">
                        <div className="h-1.5 w-1.5 rounded-full bg-gray-400 mr-1 opacity-0 animate-pulse"
                            style={{ animationDelay: '0ms', animationDuration: '1.2s' }} />
                        <div className="h-1.5 w-1.5 rounded-full bg-gray-400 mr-1 opacity-0 animate-pulse"
                            style={{ animationDelay: '300ms', animationDuration: '1.2s' }} />
                        <div className="h-1.5 w-1.5 rounded-full bg-gray-400 opacity-0 animate-pulse"
                            style={{ animationDelay: '600ms', animationDuration: '1.2s' }} />
                    </div>
                    <span>Loading</span>
                </div>
            ) : (
                <div className="animate-fadeIn">
                    {seats} {seats === 1 ? 'seat' : 'seats'} left
                </div>
            )}
        </span>
    );
}
