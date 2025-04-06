interface JoinRoomFormProps {
    userName: string;
    setUserName: (name: string) => void;
    roomId: string;
    setRoomId: (id: string) => void;
    isLoading: boolean;
    error: string;
    onBack: () => void;
    onJoin: () => void;
}

export function JoinRoomForm({
    userName,
    setUserName,
    roomId,
    setRoomId,
    isLoading,
    error,
    onBack,
    onJoin,
}: JoinRoomFormProps) {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-900">Your Name</label>
                <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    placeholder="Enter your name"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-900">Room ID</label>
                <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    placeholder="Enter room ID"
                    required
                />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex space-x-4">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Back
                </button>
                <button
                    type="button"
                    onClick={onJoin}
                    disabled={isLoading}
                    className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {isLoading ? 'Joining...' : 'Join Room'}
                </button>
            </div>
        </div>
    );
} 