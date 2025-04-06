"use client";

import { useRoom } from './hooks/useRoom';
import { InitialView } from './components/home/InitialView';
import { CreateRoomForm } from './components/home/CreateRoomForm';
import { JoinRoomForm } from './components/home/JoinRoomForm';

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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">Planning Poker</h1>

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
