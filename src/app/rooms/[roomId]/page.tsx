"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSocket } from '../../api/socket';
import { getRoom } from '../../utils/api';
import { Room, Story } from '../../../types';
import { v4 as uuidv4 } from 'uuid';

export default function RoomPage() {
    const params = useParams();
    const router = useRouter();
    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentVote, setCurrentVote] = useState<number | null>(null);
    const [showVotes, setShowVotes] = useState(false);
    const [newStoryTitle, setNewStoryTitle] = useState('');
    const [isAddingStory, setIsAddingStory] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [showCompletedStories, setShowCompletedStories] = useState(false);

    const roomId = params.roomId as string;
    const userId = localStorage.getItem('userId') || uuidv4();
    const userName = localStorage.getItem('userName') || '';

    useEffect(() => {
        if (!userName) {
            router.push('/');
            return;
        }

        const socket = getSocket();
        let isComponentMounted = true;

        // Connect to socket
        socket.connect();

        // Add connection status listener
        socket.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true);

            // Join room after connection is established
            socket.emit('join-room', {
                roomId,
                user: { id: userId, name: userName, title: userName }
            });
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        // Socket event listeners
        socket.on('room-update', (updatedRoom: Room) => {
            if (!isComponentMounted) return;
            setRoom(updatedRoom);
            setCurrentVote(updatedRoom.votes[userId] || null);
            setShowVotes(updatedRoom.revealed);
        });

        socket.on('error', (error: { message: string }) => {
            if (!isComponentMounted) return;
            console.error('Socket error:', error);
            setError(error.message);

            // If the error is about room not existing, redirect to home
            if (error.message.includes('No matching document found')) {
                router.push('/');
            }
        });

        // Fetch initial room data
        const fetchRoom = async () => {
            try {
                const roomData = await getRoom(roomId);
                if (!isComponentMounted) return;
                setRoom(roomData);
                setCurrentVote(roomData.votes[userId] || null);
                setShowVotes(roomData.revealed);
            } catch (err) {
                if (!isComponentMounted) return;
                console.error('Error fetching room:', err);
                setError('Failed to load room. Please try again.');
                router.push('/');
            } finally {
                if (isComponentMounted) {
                    setLoading(false);
                }
            }
        };

        fetchRoom();

        return () => {
            isComponentMounted = false;
            // Only leave room if socket is still connected
            if (socket.connected) {
                socket.emit('leave-room', { roomId, userId });
            }
            socket.off('room-update');
            socket.off('error');
            socket.off('connect');
            socket.off('disconnect');
            socket.disconnect();
        };
    }, [roomId, userId, userName, router]);

    const handleVote = (value: number) => {
        if (!room || room.revealed) return;
        const socket = getSocket();
        socket.emit('submit-vote', { roomId, userId, vote: value });
    };

    const handleReset = () => {
        if (!room) return;
        const socket = getSocket();
        socket.emit('reset-voting', { roomId });
    };

    const handleAddStory = () => {
        if (!newStoryTitle.trim()) return;
        const socket = getSocket();
        socket.emit('add-story', {
            roomId,
            title: newStoryTitle,
            userId,
            createdBy: userId,
            description: ''
        });
        setNewStoryTitle('');
        setIsAddingStory(false);
    };

    const handleStartVoting = (storyId: string) => {
        if (!room) return;
        console.log(room.stories, storyId);
        const story = room.stories.find(s => s.id === storyId);
        if (!story) {
            console.error('Story not found:', storyId);
            return;
        }
        const socket = getSocket();
        socket.emit('start-voting', {
            roomId,
            storyId,
            userId,
            createdBy: userId
        });
    };

    const handleCompleteStory = (storyId: string) => {
        if (!room) return;
        const story = room.stories.find(s => s.id === storyId);
        if (!story) {
            console.error('Story not found:', storyId);
            return;
        }
        const socket = getSocket();
        // First reveal votes, then complete the story
        socket.emit('reveal-votes', { roomId });
        socket.emit('complete-story', {
            roomId,
            storyId,
            userId,
            createdBy: userId
        });
    };

    const handleSkipStory = (storyId: string) => {
        if (!room) return;
        const story = room.stories.find(s => s.id === storyId);
        if (!story) {
            console.error('Story not found:', storyId);
            return;
        }
        const socket = getSocket();
        socket.emit('skip-story', {
            roomId,
            storyId,
            userId,
            createdBy: userId
        });
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-xl text-gray-900">Loading...</div>
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

    const isRoomCreator = room.createdBy === userId;
    const pokerValues = [0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100, -1]; // -1 represents '?'

    const currentStory = room.currentStory ? room.stories.find((s: Story) => s.id === room.currentStory) : null;
    console.log(room);
    return (
        <main className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{room.name}</h1>
                            {!isConnected && (
                                <p className="text-sm text-red-500 mt-1">Disconnected from server. Attempting to reconnect...</p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <div
                                onClick={handleReset}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                            >
                                Reset
                            </div>
                        </div>
                    </div>

                    {/* Story Management */}
                    {isRoomCreator && (
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2 max-w-md px-3 py-2 ">
                                <h2 className="text-xl font-semibold text-gray-900">Stories</h2>
                                <div
                                    onClick={() => setIsAddingStory(!isAddingStory)}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 cursor-pointer"
                                >
                                    {isAddingStory ? 'Cancel' : 'Add Story'}
                                </div>
                            </div>

                            {isAddingStory && (
                                <div className="mb-2 flex gap-2 max-w-md px-3 py-2">
                                    <input
                                        type="text"
                                        value={newStoryTitle}
                                        onChange={(e) => setNewStoryTitle(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                                        placeholder="Enter story title"
                                    />
                                    <div
                                        onClick={handleAddStory}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 cursor-pointer"
                                    >
                                        Add
                                    </div>
                                </div>
                            )}

                            {/* Active Stories */}
                            <div className="space-y-2 max-w-md">
                                {room.stories.filter(s => s.status !== 'completed' && s.status !== 'skipped').map((story: Story) => (
                                    <div
                                        key={story.id}
                                        className="p-4 bg-gray-50 rounded-md flex justify-between items-center"
                                    >
                                        <div>
                                            <h3 className="font-medium text-gray-900">{story.title}</h3>
                                            <p className="text-sm text-gray-600">Status: {story.status}</p>
                                            {story.points !== null && (
                                                <p className="text-sm text-gray-600">Points: {story.points}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            {story.status === 'pending' && (
                                                <div
                                                    onClick={() => handleStartVoting(story.id)}
                                                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 cursor-pointer text-sm"
                                                >
                                                    Start Voting
                                                </div>
                                            )}
                                            {story.status === 'voting' && (
                                                <>
                                                    <div
                                                        onClick={() => handleCompleteStory(story.id)}
                                                        className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 cursor-pointer text-sm"
                                                    >
                                                        Complete
                                                    </div>
                                                    <div
                                                        onClick={() => handleSkipStory(story.id)}
                                                        className="px-3 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors duration-200 cursor-pointer text-sm"
                                                    >
                                                        Skip
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Completed Stories */}
                            {room.stories.some(s => s.status === 'completed' || s.status === 'skipped') && (
                                <div className="mt-6">
                                    <div
                                        onClick={() => setShowCompletedStories(!showCompletedStories)}
                                        className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-900"
                                    >
                                        <h3 className="text-lg font-medium">Completed Stories</h3>
                                        <span>{showCompletedStories ? '▼' : '▶'}</span>
                                    </div>
                                    {showCompletedStories && (
                                        <div className="mt-2 space-y-2 max-w-md">
                                            {room.stories.filter(s => s.status === 'completed' || s.status === 'skipped').map((story: Story) => (
                                                <div
                                                    key={story.id}
                                                    className="p-4 bg-gray-50 rounded-md flex justify-between items-center"
                                                >
                                                    <div>
                                                        <h3 className="font-medium text-gray-900">{story.title}</h3>
                                                        <p className="text-sm text-gray-600">Status: {story.status}</p>
                                                        {story.points !== null && (
                                                            <p className="text-sm text-gray-600">Points: {story.points}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Current Story */}
                    {currentStory && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-md">
                            <h2 className="text-xl font-semibold mb-2 text-gray-900">
                                Current Story: {currentStory.title}
                            </h2>
                            {currentStory.points !== null && (
                                <p className="text-gray-600">Points: {currentStory.points}</p>
                            )}
                        </div>
                    )}

                    {/* Voting Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                        {pokerValues.map((value) => (
                            <div
                                key={value}
                                onClick={() => !room.revealed && handleVote(value)}
                                className={`p-4 text-xl font-bold rounded-md border-2 transition-colors duration-200 cursor-pointer ${currentVote === value
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                                    : 'border-gray-200 hover:border-indigo-300 text-gray-900'
                                    } ${room.revealed ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {value === -1 ? '?' : value}
                            </div>
                        ))}
                    </div>

                    {/* Participants */}
                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900">Participants</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {room.participants.map((participant) => (
                                <div
                                    key={participant.id}
                                    className="p-4 bg-gray-50 rounded-md flex items-center justify-between"
                                >
                                    <span className="font-medium text-gray-900">{participant.title}</span>
                                    {showVotes && (
                                        <span className="text-xl font-bold text-gray-900">
                                            {room.votes[participant.id] !== undefined ?
                                                room.votes[participant.id] === -1 ? '?' : room.votes[participant.id]
                                                : '-'}
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