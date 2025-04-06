import React from 'react';

interface RoomHeaderProps {
    roomName: string;
    isConnected: boolean;
    onReset: () => void;
}

export const RoomHeader: React.FC<RoomHeaderProps> = ({ roomName, isConnected, onReset }) => {
    return (
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{roomName}</h1>
                {!isConnected && (
                    <p className="text-sm text-red-500 mt-1">Disconnected from server. Attempting to reconnect...</p>
                )}
            </div>
            <div className="flex gap-2">
                <div
                    onClick={onReset}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                >
                    Reset
                </div>
            </div>
        </div>
    );
}; 