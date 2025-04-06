import React from 'react';
import { Room } from '../../../../types';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface ParticipantsListProps {
    participants: Room['participants'];
    votes: Room['votes'];
    revealed: boolean;
    isVotingActive: boolean;
    currentStoryStatus?: string;
}

export const ParticipantsList: React.FC<ParticipantsListProps> = ({ participants, votes, revealed, isVotingActive, currentStoryStatus }) => {
    const isActuallyVoting = isVotingActive && currentStoryStatus === 'voting';

    return (
        <div className="w-96">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Participants</h2>
            <div className="space-y-2">
                {participants.map((participant) => {
                    const hasVoted = votes[participant.id] !== undefined;
                    const voteValue = votes[participant.id];

                    return (
                        <div
                            key={participant.id}
                            className="p-3 bg-gray-50 rounded-md flex items-center justify-between"
                        >
                            <span className="font-medium text-gray-900">{participant.title}</span>

                            <div className="flex items-center gap-2">
                                {isActuallyVoting && !revealed && !hasVoted && (
                                    <div className="flex items-center gap-1">
                                        <span className="text-gray-500 text-sm">Thinking</span>
                                        <div className="flex gap-1">
                                            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                )}

                                {!revealed && hasVoted && (
                                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                )}

                                {revealed && (
                                    <>
                                        {hasVoted ? (
                                            <span className="text-sm font-bold text-gray-900">
                                                {voteValue === -1 ? '?' : voteValue}
                                            </span>
                                        ) : (
                                            <XCircleIcon className="h-5 w-5 text-red-500" />
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}; 