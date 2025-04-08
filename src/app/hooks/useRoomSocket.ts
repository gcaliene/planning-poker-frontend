import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSocket } from '../api/socket';
import { getRoom } from '../utils/api';
import { Room } from '../../types';

export function useRoomSocket(roomId: string, userId: string, userName: string) {
    const router = useRouter();
    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showError, setShowError] = useState(false);
    const [currentVote, setCurrentVote] = useState<number | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        console.log('main useEffect Room ID:', roomId);
        const socket = getSocket();
        let isComponentMounted = true;

        const emitLeaveRoom = () => {
            console.log('starting emitting leave-room event from useRoomSocket...');
            const socket = getSocket();
            if (socket.connected) {
                console.log('Emitting leave-room event from useRoomSocket');
                socket.emit('leave-room', { roomId, userId });
                socket.disconnect();
            }
        };

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            console.log('handleBeforeUnload from useRoomSocket');
            e.preventDefault();
            emitLeaveRoom();
            e.returnValue = '';
        };

        const handlePopState = () => {
            console.log('Browser back button pressed');
            emitLeaveRoom();
        };

        const handleHashChange = () => {
            console.log('Hash changed');
            emitLeaveRoom();
        };

        const handlePageHide = () => {
            console.log('Page being hidden');
            emitLeaveRoom();
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

            socket.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
                setIsConnected(false);
                
                if (reason !== 'io client disconnect') {
                    console.log('Attempting to reconnect...');
                    socket.connect();
                }
            });

            socket.on('reconnect', (attemptNumber) => {
                console.log('Reconnected after', attemptNumber, 'attempts');
                setIsConnected(true);
                
                socket.emit('join-room', {
                    roomId,
                    user: { id: userId, name: userName, title: userName }
                });
            });

            socket.on('reconnect_error', (error) => {
                console.error('Reconnection error:', error);
                setIsConnected(false);
            });

            socket.on('reconnect_failed', () => {
                console.error('Failed to reconnect');
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
                emitLeaveRoom();
                localStorage.setItem('lastRoomId', roomId);
            }
            socket.off('room-update');
            socket.off('error');
            socket.off('connect');
            socket.off('disconnect');
            socket.disconnect();
        };
    }, [roomId, userId, userName, router]);

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