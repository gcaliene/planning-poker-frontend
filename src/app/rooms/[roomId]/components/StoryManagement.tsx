import React, { useState } from 'react';
import { Story } from '../../../../types';
import { ArrowPathIcon, TrashIcon } from '@heroicons/react/24/outline';

interface StoryManagementProps {
    stories: Story[];
    isRoomCreator: boolean;
    onAddStory: (title: string) => void;
    onStartVoting: (storyId: string) => void;
    onCompleteStory: (storyId: string) => void;
    onSkipStory: (storyId: string) => void;
    onRevoteStory: (title: string) => void;
    onDeleteStory: (storyId: string) => void;
}

export const StoryManagement: React.FC<StoryManagementProps> = ({
    stories,
    isRoomCreator,
    onAddStory,
    onStartVoting,
    onCompleteStory,
    onSkipStory,
    onRevoteStory,
    onDeleteStory,
}) => {
    const [isAddingStory, setIsAddingStory] = useState(false);
    const [newStoryTitle, setNewStoryTitle] = useState('');
    const [showCompletedStories, setShowCompletedStories] = useState(false);

    const handleAddStory = () => {
        if (!newStoryTitle.trim()) return;
        onAddStory(newStoryTitle);
        setNewStoryTitle('');
        setIsAddingStory(false);
    };

    const handleRevote = (title: string) => {
        onRevoteStory(title);
    };

    const handleDelete = (storyId: string) => {
        if (window.confirm('Are you sure you want to delete this story?')) {
            onDeleteStory(storyId);
        }
    };

    return (
        <div className="mb-6">
            {/* Completed Stories */}
            {stories.some(s => s.status === 'completed' || s.status === 'skipped') && (
                <div className="mt-6">
                    <div
                        onClick={() => setShowCompletedStories(!showCompletedStories)}
                        className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-900"
                    >
                        <h3 className="text-lg font-medium">Completed Stories</h3>
                        <span>{showCompletedStories ? '▼' : '▶'}</span>
                    </div>
                    {showCompletedStories && (
                        <div className="mt-2 grid grid-cols-8 gap-2">
                            {stories.filter(s => s.status === 'completed' || s.status === 'skipped').map((story) => (
                                <div
                                    key={story.id}
                                    className="p-3 bg-gray-50 rounded-md relative group"
                                >
                                    <h3 className="font-medium text-gray-900 text-sm">{story.title}</h3>
                                    <div className="items-center mt-1">
                                        <p className="text-xs text-gray-600">{story.status}</p>
                                        {story.points !== null && (
                                            <p className="text-xs font-medium text-gray-900">Points: {story.points}</p>
                                        )}
                                    </div>
                                    {isRoomCreator && (
                                        <div className="absolute top-2 right-2 flex gap-1">
                                            <button
                                                onClick={() => handleRevote(story.title)}
                                                className="p-1 bg-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-300"
                                                title="Revote this story"
                                            >
                                                <ArrowPathIcon className="h-4 w-4 text-gray-600" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(story.id)}
                                                className="p-1 bg-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-200"
                                                title="Delete this story"
                                            >
                                                <TrashIcon className="h-4 w-4 text-gray-600" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Story Management Header */}
            <div className="flex justify-between items-center mb-2 max-w-md px-3 py-2">
                <h2 className="text-xl font-semibold text-gray-900">Stories</h2>
                {isRoomCreator && (
                    <div
                        onClick={() => setIsAddingStory(!isAddingStory)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 cursor-pointer"
                    >
                        {isAddingStory ? 'Cancel' : 'Add Story'}
                    </div>
                )}
            </div>

            {/* Add Story Form (only for room creator) */}
            {isRoomCreator && isAddingStory && (
                <div className="mb-2 flex gap-2 max-w-md px-3 py-2">
                    <input
                        type="text"
                        value={newStoryTitle}
                        onChange={(e) => setNewStoryTitle(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        placeholder="Enter story title"
                    />
                    <div
                        onClick={handleAddStory}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 cursor-pointer"
                    >
                        Add
                    </div>
                </div>
            )}

            {/* Active Stories */}
            <div className="space-y-2 max-w-md">
                {stories.filter(s => s.status !== 'completed' && s.status !== 'skipped').map((story) => (
                    <div
                        key={story.id}
                        className="p-4 bg-gray-50 rounded-md flex justify-between items-center relative group"
                    >
                        <div>
                            <h3 className="font-medium text-gray-900">{story.title}</h3>
                            <p className="text-sm text-gray-600">Status: {story.status}</p>
                            {story.points !== null && (
                                <p className="text-sm text-gray-600">Points: {story.points}</p>
                            )}
                        </div>
                        {isRoomCreator && (
                            <>
                                <div className="flex gap-2">
                                    {story.status === 'pending' && (
                                        <div
                                            onClick={() => onStartVoting(story.id)}
                                            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 cursor-pointer text-sm"
                                        >
                                            Start Voting
                                        </div>
                                    )}
                                    {story.status === 'voting' && (
                                        <>
                                            <div
                                                onClick={() => onCompleteStory(story.id)}
                                                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 cursor-pointer text-sm"
                                            >
                                                Complete
                                            </div>
                                            <div
                                                onClick={() => onSkipStory(story.id)}
                                                className="px-3 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors duration-200 cursor-pointer text-sm"
                                            >
                                                Skip
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="absolute top-2 right-2 flex gap-1">
                                    {(story.status === 'completed' || story.status === 'skipped') && (
                                        <button
                                            onClick={() => handleRevote(story.title)}
                                            className="p-1 bg-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-300"
                                            title="Revote this story"
                                        >
                                            <ArrowPathIcon className="h-4 w-4 text-gray-600" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(story.id)}
                                        className="p-1 bg-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-200"
                                        title="Delete this story"
                                    >
                                        <TrashIcon className="h-4 w-4 text-gray-600" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}; 