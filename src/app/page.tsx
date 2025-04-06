"use client";

import { useRoom } from './hooks/useRoom';
import { InitialView } from './components/home/InitialView';
import { CreateRoomForm } from './components/home/CreateRoomForm';
import { JoinRoomForm } from './components/home/JoinRoomForm';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkRoomExists } from './utils/api';

export default function Home() {
  const {
    userName,
    setUserName,
    roomName,
    setRoomName,
    roomId,
    setRoomId,
    isLoading,
    error,
    activeForm,
    setActiveForm,
    handleCreateRoom,
    handleJoinRoom,
  } = useRoom();

  const [lastRoomId, setLastRoomId] = useState<string | null>(null);
  const [lastRoomExists, setLastRoomExists] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const checkLastRoom = async () => {
      const storedRoomId = localStorage.getItem('lastRoomId');
      if (storedRoomId) {
        try {
          const exists = await checkRoomExists(storedRoomId);
          setLastRoomExists(exists);
          setLastRoomId(exists ? storedRoomId : null);
          if (!exists) {
            localStorage.removeItem('lastRoomId');
          }
        } catch (err) {
          console.error('Error checking last room:', err);
          setLastRoomExists(false);
          setLastRoomId(null);
          localStorage.removeItem('lastRoomId');
        }
      }
    };

    checkLastRoom();
  }, []);

  const handleRejoinRoom = async () => {
    if (lastRoomId) {
      const storedUserName = localStorage.getItem('userName');
      const storedUserId = localStorage.getItem('userId');

      if (storedUserName && storedUserId) {
        router.push(`/rooms/${lastRoomId}`);
      } else {
        // If we don't have stored credentials, show the join form
        setActiveForm('join');
        setRoomId(lastRoomId);
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">Planning Poker</h1>

        {lastRoomId && lastRoomExists && (
          <div className="mb-6">
            <button
              onClick={handleRejoinRoom}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Rejoin Last Room
            </button>
          </div>
        )}

        {activeForm === 'initial' ? (
          <InitialView
            onCreateRoom={() => setActiveForm('create')}
            onJoinRoom={() => setActiveForm('join')}
          />
        ) : activeForm === 'create' ? (
          <CreateRoomForm
            userName={userName}
            setUserName={setUserName}
            roomName={roomName}
            setRoomName={setRoomName}
            isLoading={isLoading}
            error={error}
            onBack={() => setActiveForm('initial')}
            onSubmit={handleCreateRoom}
          />
        ) : (
          <JoinRoomForm
            userName={userName}
            setUserName={setUserName}
            roomId={roomId}
            setRoomId={setRoomId}
            isLoading={isLoading}
            error={error}
            onBack={() => setActiveForm('initial')}
            onJoin={handleJoinRoom}
          />
        )}
      </div>
    </main>
  );
}
