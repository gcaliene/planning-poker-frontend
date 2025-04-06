import React from 'react';
import { Story } from '../../../../types';

interface CurrentStoryProps {
    currentStory: Story | null;
}

export const CurrentStory: React.FC<CurrentStoryProps> = ({ currentStory }) => {
    if (!currentStory) return null;

    return (
        <div className="mb-6 p-4 bg-gray-50 rounded-md max-w-md">
            <h2 className="text-xl font-semibold mb-2 text-gray-900">
                Current Story: {currentStory.title}
            </h2>
            <p className="text-gray-600">Status: {currentStory.status}</p>
            {currentStory.points !== null && (
                <p className="text-gray-600">Average: {currentStory.points}</p>
            )}
        </div>
    );
}; 