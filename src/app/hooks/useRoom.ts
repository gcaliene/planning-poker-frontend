import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { createRoom, checkRoomExists } from '../utils/api';

export type FormType = 'initial' | 'create' | 'join';

export function useRoom() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeForm, setActiveForm] = useState<FormType>('initial');

  // Load userName from localStorage after component mounts
  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const handleFormSwitch = (form: FormType) => {
    setError('');
    setActiveForm(form);
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let userId = localStorage.getItem('userId');
      if (!userId) {
        userId = uuidv4();
        localStorage.setItem('userId', userId);
      }

      localStorage.setItem('userName', userName);

      const { roomId } = await createRoom(roomName, userId);
      console.log('Created room with ID:', roomId);

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

  const handleJoinRoom = async () => {
    if (!roomId || !userName) {
      setError('Please enter both your name and a room ID');
      return;
    }

    try {
      const exists = await checkRoomExists(roomId);
      if (!exists) {
        setError('Room does not exist');
        return;
      }

      localStorage.setItem('userName', userName);
      router.push(`/rooms/${roomId}`);
    } catch (err) {
      console.error('Error joining room:', err);
      setError('Failed to join room. Please try again.');
    }
  };

  return {
    userName,
    setUserName,
    roomName,
    setRoomName,
    roomId,
    setRoomId,
    isLoading,
    error,
    activeForm,
    setActiveForm: handleFormSwitch,
    handleCreateRoom,
    handleJoinRoom,
  };
} 