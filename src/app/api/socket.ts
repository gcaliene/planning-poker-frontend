import { io, Socket } from 'socket.io-client';

let socket: Socket;

export const getSocket = () => {
  if (!socket) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    socket = io(API_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      path: '/socket.io'
    });
  }
  return socket;
}; 