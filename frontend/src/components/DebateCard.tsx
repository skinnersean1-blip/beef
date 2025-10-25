import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, TrendingUp, Users, Clock, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Debate } from '../types';

interface DebateCardProps {
  debate: Debate;
}

const DebateCard: React.FC<DebateCardProps> = ({ debate }) => {
  const getStatusColor = () => {
    switch (debate.status) {
      case 'OPEN':
        return 'bg-green-500';
      case 'ACTIVE':
        return 'bg-blue-500';
      case 'EXTENDED':
        return 'bg-purple-500';
      case 'COMPLETED':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTimeRemaining = () => {
    if (!debate.endsAt) return null;
    const endTime = new Date(debate.endsAt);
    const now = new Date();
    if (endTime < now) return 'Ended';
    return `${formatDistanceToNow(endTime)} left`;
  };

  return (
    <Link
      to={`/debates/${debate.id}`}
      className="block bg-beef-gray rounded-lg p-6 hover:bg-opacity-80 transition-all hover:scale-[1.02] border border-transparent hover:border-beef-red"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor()} text-white`}
            >
              {debate.status}
            </span>
            <span className="text-xs text-gray-400">{debate.category}</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{debate.topic}</h3>
          <p className="text-gray-400 text-sm line-clamp-2">{debate.description}</p>
        </div>
        <div className="text-right ml-4">
          <div className="flex items-center space-x-1 text-green-500 font-bold text-lg">
            <DollarSign className="w-5 h-5" />
            <span>{debate.totalPot.toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-400">Total Pot</p>
        </div>
      </div>

      {/* Participants */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-beef-dark rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Creator</p>
          <p className="text-white font-semibold">{debate.creator.displayName}</p>
          <p className="text-xs text-gray-400 italic line-clamp-1">
            {debate.creatorPosition}
          </p>
        </div>
        <div className="bg-beef-dark rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Challenger</p>
          {debate.challenger ? (
            <>
              <p className="text-white font-semibold">{debate.challenger.displayName}</p>
              <p className="text-xs text-gray-400 italic line-clamp-1">
                {debate.challengerPosition}
              </p>
            </>
          ) : (
            <p className="text-gray-500">Waiting...</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <MessageSquare className="w-4 h-4" />
            <span>{debate._count?.comments || 0}</span>
          </div>
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-4 h-4" />
            <span>{debate._count?.bets || 0} bets</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{debate._count?.votes || 0} votes</span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4" />
          <span>{getTimeRemaining() || formatDistanceToNow(new Date(debate.createdAt))} ago</span>
        </div>
      </div>
    </Link>
  );
};

export default DebateCard;
