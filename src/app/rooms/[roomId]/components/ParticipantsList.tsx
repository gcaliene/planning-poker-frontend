import React from 'react';
import { Room } from '../../../../types';

interface ParticipantsListProps {
    participants: Room['participants'];
    votes: Room['votes'];
    showVotes: boolean;
}

export const ParticipantsList: React.FC<ParticipantsListProps> = ({ participants, votes, showVotes }) => {
    return (
        <div className="w-64">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Participants</h2>
            <div className="space-y-2">
                {participants.map((participant) => (
                    <div
                        key={participant.id}
                        className="p-3 bg-gray-50 rounded-md"
                    >
                        <span className="font-medium text-gray-900">{participant.title}</span>
                        {showVotes && (
                            <span className="block text-sm font-bold text-gray-900 mt-1">
                                {votes[participant.id] !== undefined ?
                                    votes[participant.id] === -1 ? '?' : votes[participant.id]
                                    : '-'}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}; 