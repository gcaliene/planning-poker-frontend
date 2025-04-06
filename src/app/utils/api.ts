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

  return response.json();
}

export async function getRoom(roomId: string) {
  const response = await fetch(`${API_URL}/api/rooms/${roomId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch room');
  }

  return response.json();
} 