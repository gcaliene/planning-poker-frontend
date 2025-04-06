import React from 'react';

interface VotingCardsProps {
    pokerValues: number[];
    currentVote: number | null;
    revealed: boolean;
    onVote: (value: number) => void;
    isVotingActive: boolean;
}

export const VotingCards: React.FC<VotingCardsProps> = ({ pokerValues, currentVote, revealed, onVote, isVotingActive }) => {
    return (
        <div className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {pokerValues.map((value) => (
                    <div
                        key={value}
                        onClick={() => isVotingActive && !revealed && onVote(value)}
                        className={`p-4 text-xl font-bold rounded-md border-2 transition-colors duration-200 ${isVotingActive && !revealed ? 'cursor-pointer hover:border-indigo-300' : 'cursor-not-allowed opacity-50'
                            } ${currentVote === value
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                                : 'border-gray-200 text-gray-900'
                            }`}
                    >
                        {value === -1 ? '?' : value}
                    </div>
                ))}
            </div>
        </div>
    );
}; 