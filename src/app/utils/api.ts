const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function createRoom(name: string, createdBy: string) {
  const response = await fetch(`${API_URL}/api/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, createdBy }),
  });

  if (!response.ok) {
    throw new Error('Failed to create room');
  }

  const data = await response.json();
  console.log('API Response:', data);
  
  // Ensure we have a roomId in the response
  if (!data.id) {
    throw new Error('Invalid response from server: missing roomId');
  }

  return { roomId: data.id };
}

export async function getRoom(roomId: string) {
  const response = await fetch(`${API_URL}/api/rooms/${roomId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch room');
  }

  return response.json();
}

export async function checkRoomExists(roomId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/rooms/${roomId}`);
    return response.ok;
  } catch (error) {
    console.error('Error checking room existence:', error);
    return false;
  }
} 