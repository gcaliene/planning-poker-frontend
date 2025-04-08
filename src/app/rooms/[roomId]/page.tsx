"use client";

import { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Story } from '../../../types';
import { RoomHeader } from './components/RoomHeader';
import { CurrentStory } from './components/CurrentStory';
import { StoryManagement } from './components/StoryManagement';
import { ParticipantsList } from './components/ParticipantsList';
import { VotingCards } from './components/VotingCards';
import { useRoomSocket } from '../../hooks/useRoomSocket';
import { useStoryHandlers } from '../../hooks/useStoryHandlers';

export default function RoomPage() {
    const params = useParams();
    const router = useRouter();
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

    const {
        room,
        loading,
        error,
        showError,
        currentVote,
        isConnected
    } = useRoomSocket(roomId, userData.id, userData.name);

    const {
        handleVote,
        handleReset,
        handleAddStory,
        handleStartVoting,
        handleCompleteStory,
        handleSkipStory,
        handleRevoteStory,
        handleDeleteStory
    } = useStoryHandlers(roomId, userData.id, room);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-xl text-gray-900">Loading...</div>
            </div>
        );
    }

    if (showError) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-xl text-red-500 animate-fade-in-out">{error}</div>
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
                        roomId={roomId}
                        createdAt={room.createdAt}
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