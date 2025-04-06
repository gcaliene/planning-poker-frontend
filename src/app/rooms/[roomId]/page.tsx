"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSocket } from '../../api/socket';
import { getRoom } from '../../utils/api';
import { Room, Story } from '../../../types';
import { v4 as uuidv4 } from 'uuid';
import { RoomHeader } from './components/RoomHeader';
import { CurrentStory } from './components/CurrentStory';
import { StoryManagement } from './components/StoryManagement';
import { ParticipantsList } from './components/ParticipantsList';
import { VotingCards } from './components/VotingCards';

export default function RoomPage() {
    const params = useParams();
    const router = useRouter();
    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentVote, setCurrentVote] = useState<number | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const roomId = params.roomId as string;

    // Use useMemo to prevent unnecessary re-renders
    const userData = useMemo(() => {
        const id = localStorage.getItem('userId') || uuidv4();
        const name = localStorage.getItem('userName') || '';
        return { id, name };
    }, []); // Empty dependency array means this only runs once

    // Separate effect for user data validation
    useEffect(() => {
        if (!userData.name) {
            router.push('/');
        }
    }, [userData.name, router]);

    // Main effect for room and socket management
    useEffect(() => {
        console.log('main useEffect Room ID:', roomId);
        if (!userData.name) return;

        const socket = getSocket();
        let isComponentMounted = true;

        const setupSocket = () => {
            if (!socket.connected) {
                socket.connect();
            }

            socket.on('connect', () => {
                console.log('Socket connected');
                setIsConnected(true);

                socket.emit('join-room', {
                    roomId,
                    user: { id: userData.id, name: userData.name, title: userData.name }
                });
            });

            socket.on('disconnect', () => {
                console.log('Socket disconnected');
                setIsConnected(false);
            });

            socket.on('room-update', (updatedRoom: Room) => {
                if (!isComponentMounted) return;
                console.log('Room update received:', {
                    currentStory: updatedRoom.currentStory,
                    stories: updatedRoom.stories
                });
                setRoom(updatedRoom);
                setCurrentVote(updatedRoom.currentStory ? updatedRoom.votes[userData.id] || null : null);
            });

            socket.on('error', (error: { message: string }) => {
                if (!isComponentMounted) return;
                console.error('Socket error:', error);
                setError(error.message);

                if (error.message.includes('No matching document found')) {
                    router.push('/');
                }
            });
        };

        const fetchRoom = async () => {
            try {
                const roomData = await getRoom(roomId);
                if (!isComponentMounted) return;
                setRoom(roomData);
                setCurrentVote(roomData.votes[userData.id] || null);
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

        setupSocket();
        fetchRoom();

        return () => {
            isComponentMounted = false;
            if (socket.connected) {
                socket.emit('leave-room', { roomId, userId: userData.id });
            }
            socket.off('room-update');
            socket.off('error');
            socket.off('connect');
            socket.off('disconnect');
            socket.disconnect();
        };
    }, [roomId, userData, router]); // Now depends on the stable userData object

    const handleVote = (value: number) => {
        if (!room || room.revealed) return;
        const socket = getSocket();
        socket.emit('submit-vote', { roomId, userId: userData.id, vote: value });
    };

    const handleReset = () => {
        if (!room) return;
        const socket = getSocket();
        console.log('Before reset:', { currentStory: room.currentStory });
        socket.emit('reset-voting', { roomId });
        setCurrentVote(null);
    };

    const handleAddStory = (title: string) => {
        if (!title.trim()) return;
        const socket = getSocket();
        socket.emit('add-story', {
            roomId,
            title,
            userId: userData.id,
            createdBy: userData.id,
            description: ''
        });
    };

    const handleStartVoting = (storyId: string) => {
        if (!room) return;
        const story = room.stories.find(s => s.id === storyId);
        if (!story) {
            console.error('Story not found:', storyId);
            return;
        }
        const socket = getSocket();
        socket.emit('start-voting', {
            roomId,
            storyId,
            userId: userData.id,
            createdBy: userData.id
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
        socket.emit('reveal-votes', { roomId });
        socket.emit('complete-story', {
            roomId,
            storyId,
            userId: userData.id,
            createdBy: userData.id
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
            userId: userData.id,
            createdBy: userData.id
        });
    };

    const handleRevoteStory = (title: string) => {
        if (!room) return;
        const socket = getSocket();
        socket.emit('add-story', {
            roomId,
            title,
            userId: userData.id,
            createdBy: userData.id,
            description: ''
        });
    };

    const handleDeleteStory = (storyId: string) => {
        if (!room) return;
        const socket = getSocket();
        socket.emit('delete-story', {
            roomId,
            storyId,
            userId: userData.id
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

    const isRoomCreator = room.createdBy === userData.id;
    const pokerValues = [0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100, -1];
    const currentStory = room.currentStory ? room.stories.find((s: Story) => s.id === room.currentStory) ?? null : null;

    return (
        <main className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <RoomHeader
                        roomName={room.name}
                        isConnected={isConnected}
                        onReset={handleReset}
                        isRoomCreator={isRoomCreator}
                    />

                    <div className="flex gap-6">
                        {/* Left Column - Stories and Current Story */}
                        <div className="flex-1">
                            <CurrentStory currentStory={currentStory} />

                            <StoryManagement
                                stories={room.stories}
                                isRoomCreator={isRoomCreator}
                                onAddStory={handleAddStory}
                                onStartVoting={handleStartVoting}
                                onCompleteStory={handleCompleteStory}
                                onSkipStory={handleSkipStory}
                                onRevoteStory={handleRevoteStory}
                                onDeleteStory={handleDeleteStory}
                            />
                        </div>

                        {/* Right Column - Participants */}
                        <ParticipantsList
                            participants={room.participants}
                            votes={room.votes}
                            revealed={room.revealed}
                            isVotingActive={!!room.currentStory}
                            currentStoryStatus={currentStory?.status}
                        />
                    </div>

                    {/* Voting Cards */}
                    <VotingCards
                        pokerValues={pokerValues}
                        currentVote={currentVote}
                        revealed={room.revealed}
                        onVote={handleVote}
                        isVotingActive={!!room.currentStory}
                        currentStoryStatus={currentStory?.status}
                        votes={room.votes}
                        participants={room.participants}
                    />
                </div>
            </div>
        </main>
    );
} 