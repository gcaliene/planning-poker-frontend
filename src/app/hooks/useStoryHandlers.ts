import { useCallback } from 'react';
import { getSocket } from '../api/socket';
import { Room, Story } from '../../types';

export function useStoryHandlers(roomId: string, userId: string, room: Room | null) {
    const handleVote = useCallback((value: number) => {
        if (!room || room.revealed) return;
        const socket = getSocket();
        socket.emit('submit-vote', { roomId, userId, vote: value });
    }, [room, roomId, userId]);

    const handleReset = useCallback(() => {
        if (!room) return;
        const socket = getSocket();
        console.log('Before reset:', { currentStory: room.currentStory });
        socket.emit('reset-voting', { roomId });
    }, [room, roomId]);

    const handleAddStory = useCallback((title: string) => {
        if (!title.trim()) return;
        const socket = getSocket();
        socket.emit('add-story', {
            roomId,
            title,
            userId,
            createdBy: userId,
            description: ''
        });
    }, [roomId, userId]);

    const handleStartVoting = useCallback((storyId: string) => {
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
            userId,
            createdBy: userId
        });
    }, [room, roomId, userId]);

    const handleCompleteStory = useCallback((storyId: string) => {
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
            userId,
            createdBy: userId
        });
    }, [room, roomId, userId]);

    const handleSkipStory = useCallback((storyId: string) => {
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
    }, [room, roomId, userId]);

    const handleRevoteStory = useCallback((title: string) => {
        if (!room) return;
        const socket = getSocket();
        socket.emit('add-story', {
            roomId,
            title,
            userId,
            createdBy: userId,
            description: ''
        });
    }, [room, roomId, userId]);

    const handleDeleteStory = useCallback((storyId: string) => {
        if (!room) return;
        const socket = getSocket();
        socket.emit('delete-story', {
            roomId,
            storyId,
            userId
        });
    }, [room, roomId, userId]);

    return {
        handleVote,
        handleReset,
        handleAddStory,
        handleStartVoting,
        handleCompleteStory,
        handleSkipStory,
        handleRevoteStory,
        handleDeleteStory
    };
} 