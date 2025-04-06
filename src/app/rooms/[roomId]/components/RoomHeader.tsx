import React, { useState } from 'react';
import { FaCopy, FaHome } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface RoomHeaderProps {
    roomName: string;
    isConnected: boolean;
    onReset: () => void;
    isRoomCreator: boolean;
    roomId: string;
    createdAt: string;
}

export const RoomHeader: React.FC<RoomHeaderProps> = ({
    roomName,
    isConnected,
    onReset,
    isRoomCreator,
    roomId,
    createdAt
}) => {
    const [showCopied, setShowCopied] = useState(false);
    const router = useRouter();

    const handleCopyRoomId = async () => {
        try {
            await navigator.clipboard.writeText(roomId);
            setShowCopied(true);
            setTimeout(() => setShowCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy room ID:', err);
        }
    };

    return (
        <div className="flex justify-between items-start mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{roomName}</h1>
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    <span>Room ID: {roomId}</span>
                    <button
                        onClick={handleCopyRoomId}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                        title="Copy Room ID"
                    >
                        <FaCopy className="w-3 h-3" />
                    </button>
                    {showCopied && (
                        <span className="text-green-600 font-medium animate-fade-in-out">
                            Copied!
                        </span>
                    )}
                </div>
                <div className="text-sm text-gray-600">
                    Created: {new Date(createdAt).toLocaleDateString()}
                </div>
                {!isConnected && (
                    <p className="text-sm text-red-500 mt-1">Disconnected from server. Attempting to reconnect...</p>
                )}
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => router.push('/')}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200 flex items-center gap-2"
                >
                    <FaHome className="w-4 h-4" />
                    Back to Home
                </button>
                {isRoomCreator && (
                    <div
                        onClick={onReset}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                    >
                        Reset
                    </div>
                )}
            </div>
        </div>
    );
}; 