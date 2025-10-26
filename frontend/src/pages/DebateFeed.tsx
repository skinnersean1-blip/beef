import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { debateAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const DebateFeed: React.FC = () => {
  const [debates, setDebates] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  const inviteUrl = user ? `${window.location.origin}/register?ref=${user.referralCode}` : '';

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    loadDebates();
  }, [filter, search]);

  const loadDebates = async () => {
    try {
      const params: any = {};
      if (filter !== 'all') params.status = filter.toUpperCase();
      if (search) params.search = search;

      const response = await debateAPI.getDebates(params);
      setDebates(response.data);
    } catch (error) {
      console.error('Failed to load debates:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'text-green-400';
      case 'ACTIVE': return 'text-yellow-400';
      case 'COMPLETED': return 'text-gray-400';
      default: return 'text-beef-light';
    }
  };

  return (
    <div className="min-h-screen bg-beef-secondary">
      <nav className="bg-beef-gray border-b border-beef-primary">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-beef-primary">Beef</h1>
          <div className="flex items-center gap-4">
            <span className="text-beef-light">Wallet: {user && `$${user.walletBalance.toFixed(2)}`}</span>
            <button
              onClick={() => setShowInviteModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 transition"
            >
              Invite Friends
            </button>
            <Link
              to="/create"
              className="bg-beef-primary text-white px-4 py-2 rounded font-semibold hover:bg-orange-600 transition"
            >
              Start a Beef
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search debates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 bg-beef-gray text-beef-light rounded border border-beef-gray focus:border-beef-primary focus:outline-none"
          />
        </div>

        <div className="mb-6 flex gap-2">
          {['all', 'open', 'active', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded font-semibold transition ${
                filter === f
                  ? 'bg-beef-primary text-white'
                  : 'bg-beef-gray text-beef-light hover:bg-beef-primary/20'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {debates.map((debate) => (
            <Link
              key={debate.id}
              to={`/debate/${debate.id}`}
              className="block bg-beef-gray p-6 rounded-lg hover:bg-beef-gray/80 transition border border-transparent hover:border-beef-primary"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-bold text-beef-light">{debate.topic}</h3>
                <span className={`text-sm font-semibold ${getStatusColor(debate.status)}`}>
                  {debate.status}
                </span>
              </div>
              <div className="text-sm text-gray-400 mb-3">
                <span>Creator: {debate.creator.displayName}</span>
                {debate.challenger && <span className="ml-4">vs {debate.challenger.displayName}</span>}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>Pot: ${debate.totalPot}</span>
                <span>{debate._count.comments} comments</span>
                <span>{debate._count.bets} bets</span>
              </div>
            </Link>
          ))}
        </div>

        {debates.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            <p>No debates found. Be the first to start a beef!</p>
          </div>
        )}
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowInviteModal(false)}>
          <div className="bg-beef-gray p-8 rounded-lg shadow-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-beef-primary mb-4">Invite Friends</h2>
            <p className="text-beef-light mb-4">
              Share your invite link and earn $50 for each friend who joins! They'll get an extra $25 bonus too.
            </p>
            <div className="bg-beef-secondary p-4 rounded mb-4">
              <p className="text-sm text-gray-400 mb-2">Your Invite Link:</p>
              <p className="text-beef-light break-all">{inviteUrl}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyInviteLink}
                className="flex-1 bg-beef-primary text-white py-2 rounded font-semibold hover:bg-orange-600 transition"
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 bg-gray-600 text-white py-2 rounded font-semibold hover:bg-gray-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
