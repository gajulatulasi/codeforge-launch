import React from 'react';
import Leaderboard from '../components/Leaderboard';
import { Trophy } from 'lucide-react';

const LeaderboardPage = ({ isEmbedded }) => {
  return (
    <div className={isEmbedded ? "" : "max-w-6xl mx-auto px-6 py-10"}>
      {!isEmbedded && (
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/20">
            <Trophy className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-extrabold mb-2">Global Leaderboard</h1>
          <p className="text-gray-400">Compete with members worldwide. Filter by Department or Year to see your local standing.</p>
        </div>
      )}

      <Leaderboard />
    </div>
  );
};

export default LeaderboardPage;
