import { io, Socket } from 'socket.io-client';

let socket: Socket;

export const getSocket = () => {
  if (!socket) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    socket = io(API_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      path: '/socket.io',
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    // Add connection error handling
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('connect_timeout', (timeout) => {
      console.error('Socket connection timeout:', timeout);
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Attempting to reconnect:', attemptNumber);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
    });

    socket.on('reconnect_failed', () => {
      console.error('Failed to reconnect');
    });

    // Add handler for disconnect event
    socket.on('disconnect', (reason) => {
      console.log('[SocketService] User disconnected:', reason);
      // Emit leave-room event when socket disconnects
      if (socket.connected) {
        const roomId = localStorage.getItem('lastRoomId');
        const userId = localStorage.getItem('userId');
        if (roomId && userId) {
          socket.emit('leave-room', { roomId, userId });
        }
      }
    });
  }
  return socket;
}; 