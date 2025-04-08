import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSocket } from '../api/socket';
import { getRoom } from '../utils/api';
import { Room } from '../../types';
import { debounce } from '../utils/debounce';

export function useRoomSocket(roomId: string, userId: string, userName: string) {
    const router = useRouter();
    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showError, setShowError] = useState(false);
    const [currentVote, setCurrentVote] = useState<number | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const emitLeaveRoom = useCallback(() => {
        console.log('Emitting leave-room event');
        const socket = getSocket();
        if (socket.connected) {
            console.log('Emitting leave-room event');
            socket.emit('leave-room', { roomId, userId });
            socket.disconnect();
        }
    }, [roomId, userId]);

    const debouncedLeaveRoom = useCallback(debounce(emitLeaveRoom, 500), [emitLeaveRoom]);

    useEffect(() => {
        console.log('main useEffect Room ID:', roomId);
        const socket = getSocket();
        let isComponentMounted = true;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            // Use immediate leave-room emission for beforeunload
            emitLeaveRoom();
            e.returnValue = '';
        };

        const handlePopState = () => {
            console.log('Browser back button pressed');
            debouncedLeaveRoom();
        };

        const handleHashChange = () => {
            console.log('Hash changed');
            debouncedLeaveRoom();
        };

        const handlePageHide = () => {
            console.log('Page being hidden');
            debouncedLeaveRoom();
        };

        const setupSocket = () => {
            if (!socket.connected) {
                socket.connect();
            }

            socket.on('connect', () => {
                console.log('Socket connected');
                setIsConnected(true);

                socket.emit('join-room', {
                    roomId,
                    user: { id: userId, name: userName, title: userName }
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
                    stories: updatedRoom.stories,
                    participants: updatedRoom.participants.map(p => ({ id: p.id, name: p.title })),
                    votes: updatedRoom.votes
                });
                setRoom(updatedRoom);
                setCurrentVote(updatedRoom.currentStory ? updatedRoom.votes[userId] || null : null);
            });

            socket.on('error', (error: { message: string }) => {
                if (!isComponentMounted) return;
                console.error('Socket error:', error);
                setError(error.message);
                setShowError(true);

                if (error.message.includes('No matching document found')) {
                    setTimeout(() => {
                        if (isComponentMounted) {
                            setShowError(false);
                            router.push('/');
                        }
                    }, 3000);
                }
            });
        };

        const fetchRoom = async () => {
            try {
                const roomData = await getRoom(roomId);
                if (!isComponentMounted) return;
                setRoom(roomData);
                setCurrentVote(roomData.votes[userId] || null);
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

        // Add all event listeners
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopState);
        window.addEventListener('hashchange', handleHashChange);
        window.addEventListener('pagehide', handlePageHide);

        setupSocket();
        fetchRoom();

        return () => {
            isComponentMounted = false;
            // Remove all event listeners
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
            window.removeEventListener('hashchange', handleHashChange);
            window.removeEventListener('pagehide', handlePageHide);

            if (socket.connected) {
                debouncedLeaveRoom();
                localStorage.setItem('lastRoomId', roomId);
            }
            socket.off('room-update');
            socket.off('error');
            socket.off('connect');
            socket.off('disconnect');
            socket.disconnect();
        };
    }, [roomId, userId, userName, router, debouncedLeaveRoom]);

    return {
        room,
        loading,
        error,
        showError,
        currentVote,
        isConnected,
        setCurrentVote
    };
} 