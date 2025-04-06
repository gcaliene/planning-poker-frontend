export interface User {
  id: string;
  name: string;
  title: string;
}

export interface Story {
  id: string;
  title: string;
  status: 'pending' | 'voting' | 'completed' | 'skipped';
  points: number | null;
  createdAt: string;
  roomId: string;
  createdBy: string;
  description?: string;
}

export interface Room {
  id: string;
  name: string;
  createdBy: string;
  participants: User[];
  votes: Record<string, number>;
  revealed: boolean;
  stories: Story[];
  currentStory: string | null;
  createdAt: string;
} 