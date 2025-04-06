import React from 'react';

interface VotingCardsProps {
    pokerValues: number[];
    currentVote: number | null;
    revealed: boolean;
    onVote: (value: number) => void;
}

export const VotingCards: React.FC<VotingCardsProps> = ({ pokerValues, currentVote, revealed, onVote }) => {
    return (
        <div className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {pokerValues.map((value) => (
                    <div
                        key={value}
                        onClick={() => !revealed && onVote(value)}
                        className={`p-4 text-xl font-bold rounded-md border-2 transition-colors duration-200 cursor-pointer ${currentVote === value
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                            : 'border-gray-200 hover:border-indigo-300 text-gray-900'
                            } ${revealed ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {value === -1 ? '?' : value}
                    </div>
                ))}
            </div>
        </div>
    );
}; 