"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSocket } from '../../api/socket';
import { getRoom } from '../../utils/api';
import { Room, User } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export default function RoomPage() {
    const params = useParams();
    const router = useRouter();
    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentVote, setCurrentVote] = useState<string | null>(null);
    const [showVotes, setShowVotes] = useState(false);

    const roomId = params.roomId as string;
    const userId = localStorage.getItem('userId') || uuidv4();
    const userName = localStorage.getItem('userName') || '';

    useEffect(() => {
        if (!userName) {
            router.push('/');
            return;
        }

        const socket = getSocket();

        // Connect to socket
        socket.connect();

        // Join room
        socket.emit('joinRoom', { roomId, userId, userName });

        // Fetch initial room data
        const fetchRoom = async () => {
            try {
                const roomData = await getRoom(roomId);
                console.log('Room data:', roomData);
                setRoom(roomData);
                setCurrentVote(roomData.votes[userId] || null);
                setShowVotes(roomData.revealed);
            } catch (err) {
                setError('Failed to load room. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRoom();

        // Socket event listeners
        socket.on('roomUpdated', (updatedRoom: Room) => {
            setRoom(updatedRoom);
            setCurrentVote(updatedRoom.votes[userId] || null);
            setShowVotes(updatedRoom.revealed);
        });

        socket.on('error', (error: string) => {
            setError(error);
        });

        return () => {
            socket.off('roomUpdated');
            socket.off('error');
            socket.disconnect();
        };
    }, [roomId, userId, userName, router]);

    const handleVote = (value: string) => {
        const socket = getSocket();
        socket.emit('vote', { roomId, userId, value });
        setCurrentVote(value);
    };

    const handleReveal = () => {
        const socket = getSocket();
        socket.emit('reveal', { roomId });
    };

    const handleReset = () => {
        const socket = getSocket();
        socket.emit('reset', { roomId });
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-xl text-red-500">{error}</div>
            </div>
        );
    }

    if (!room) {
        return null;
    }

    const pokerValues = ['0', '½', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?'];

    return (
        <main className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">{room.name}</h1>
                        <div className="flex gap-2">
                            <button
                                onClick={handleReveal}
                                disabled={room.revealed}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                            >
                                Reveal Votes
                            </button>
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    {room.currentStory && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-md">
                            <h2 className="text-xl font-semibold mb-2">{room.currentStory.title}</h2>
                            {room.currentStory.description && (
                                <p className="text-gray-600">{room.currentStory.description}</p>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                        {pokerValues.map((value) => (
                            <button
                                key={value}
                                onClick={() => handleVote(value)}
                                disabled={room.revealed}
                                className={`p-4 text-xl font-bold rounded-md border-2 ${currentVote === value
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                                    : 'border-gray-200 hover:border-indigo-300'
                                    } ${room.revealed ? 'opacity-50' : ''}`}
                            >
                                {value}
                            </button>
                        ))}
                    </div>

                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-4">Participants</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {room.participants.map((participant: User) => (
                                <div
                                    key={participant.id}
                                    className="p-4 bg-gray-50 rounded-md flex items-center justify-between"
                                >
                                    <span className="font-medium">{participant.name}</span>
                                    {showVotes && (
                                        <span className="text-xl font-bold">
                                            {room.votes[participant.id] || '?'}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
} 