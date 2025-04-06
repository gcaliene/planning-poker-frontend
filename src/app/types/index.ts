export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface Room {
  id: string;
  name: string;
  createdBy: string;
  participants: User[];
  currentStory: Story | null;
  votes: Record<string, string | null>;
  revealed: boolean;
  createdAt: string;
}

export interface Story {
  id: string;
  title: string;
  description?: string;
} 