"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createRoom } from './utils/api';
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Create a user ID if not in local storage
      let userId = localStorage.getItem('userId');
      if (!userId) {
        userId = uuidv4();
        localStorage.setItem('userId', userId);
      }

      // Store user name
      localStorage.setItem('userName', userName);

      const { roomId } = await createRoom(roomName, userId);
      console.log('Created room with ID:', roomId); // Debug log

      if (!roomId) {
        throw new Error('Room ID is missing');
      }

      router.push(`/rooms/${roomId}`);
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Failed to create room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = () => {
    if (!roomId || !userName) {
      setError('Please enter both your name and a room ID');
      return;
    }
    localStorage.setItem('userName', userName);
    router.push(`/rooms/${roomId}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">Planning Poker</h1>

        <form onSubmit={handleCreateRoom} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900">Your Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">Room Name</label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              placeholder="Enter room name"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div
            onClick={handleCreateRoom}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 cursor-pointer"
          >
            {isLoading ? 'Creating...' : 'Create Room'}
          </div>
        </form>

        <div className="mt-4">
          <p className="text-center text-sm text-gray-600">or</p>
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-900">Join Existing Room</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 text-gray-900"
                placeholder="Enter room ID"
              />
              <div
                onClick={handleJoinRoom}
                className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-900 text-sm hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
              >
                Join
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
