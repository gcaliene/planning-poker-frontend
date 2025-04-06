import React from 'react';
import { User } from '../../../../types';

interface VotingCardsProps {
    pokerValues: number[];
    currentVote: number | null;
    revealed: boolean;
    onVote: (value: number) => void;
    isVotingActive: boolean;
    currentStoryStatus: string | undefined;
    votes: Record<string, number>;
    participants: User[];
}

export const VotingCards: React.FC<VotingCardsProps> = ({
    pokerValues,
    currentVote,
    revealed,
    onVote,
    isVotingActive,
    currentStoryStatus,
    votes,
    participants,
}) => {
    const isActuallyVoting = isVotingActive && currentStoryStatus === 'voting';
    const canVote = isActuallyVoting && !revealed;

    // Count votes for each value
    const voteCounts = pokerValues.reduce((acc, value) => {
        acc[value] = Object.values(votes).filter(vote => vote === value).length;
        return acc;
    }, {} as Record<number, number>);

    // Get voters for each value
    const getVotersForValue = (value: number) => {
        return Object.entries(votes)
            .filter(([, vote]) => vote === value)
            .map(([userId]) => participants.find(p => p.id === userId))
            .filter(Boolean) as User[];
    };

    return (
        <div className="grid grid-cols-6 gap-4 p-4">
            {pokerValues.map((value) => {
                const isSelected = currentVote === value;
                const voteCount = voteCounts[value];
                const voters = getVotersForValue(value);
                const hasVotes = voteCount > 0;

                return (
                    <div
                        key={value}
                        onClick={() => canVote && onVote(value)}
                        className={`
                            relative p-4 rounded-lg text-center transition-all duration-200
                            ${canVote ? 'cursor-pointer hover:bg-gray-100' : 'cursor-not-allowed'}
                            ${!isActuallyVoting && !hasVotes ? 'opacity-50' : ''}
                            ${isSelected ? 'bg-indigo-100 border-2 border-indigo-500' : 'bg-white border border-gray-200'}
                            ${revealed && hasVotes ? 'shadow-md shadow-green-100 border-green-300' : ''}
                            ${revealed && hasVotes ? 'bg-green-50 border-2 border-green-500 shadow-lg shadow-green-200' : ''}
                        `}
                    >
                        <div className="text-2xl font-bold text-gray-900">
                            {value === -1 ? '?' : value}
                        </div>

                        {/* Vote count badge - only show when revealed */}
                        {revealed && hasVotes && (
                            <div className="absolute top-1 right-1 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                {voteCount}
                            </div>
                        )}

                        {/* Voters list - only show when revealed */}
                        {revealed && hasVotes && (
                            <div className="mt-2 space-y-1">
                                {voters.map((voter) => (
                                    <div key={voter.id} className="text-xs text-gray-600 truncate">
                                        <div className="font-medium">{voter.name}</div>
                                        {voter.title && (
                                            <div className="text-gray-500 text-[10px]">{voter.title}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}; 