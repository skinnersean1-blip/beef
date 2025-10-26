import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { debateAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const DebateView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [debate, setDebate] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [betAmount, setBetAmount] = useState('10');
  const [selectedWinner, setSelectedWinner] = useState('');
  const [challengerPosition, setChallengerPosition] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) loadDebate();
  }, [id]);

  const loadDebate = async () => {
    try {
      const response = await debateAPI.getDebate(id!);
      setDebate(response.data);
    } catch (error) {
      console.error('Failed to load debate:', error);
    }
  };

  const handleAcceptDebate = async () => {
    if (!challengerPosition) {
      alert('Please enter your position');
      return;
    }
    try {
      await debateAPI.acceptDebate(id!, { challengerPosition });
      loadDebate();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to accept debate');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await debateAPI.addComment(id!, {
        content: comment,
        type: 'ARGUMENT',
      });
      setComment('');
      loadDebate();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to add comment');
    }
  };

  const handlePlaceBet = async () => {
    if (!selectedWinner) {
      alert('Please select who you think will win');
      return;
    }
    try {
      await debateAPI.placeBet({
        debateId: id,
        predictedWinner: selectedWinner,
        amount: parseFloat(betAmount),
      });
      alert('Bet placed successfully!');
      loadDebate();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to place bet');
    }
  };

  if (!debate) {
    return <div className="min-h-screen bg-beef-secondary flex items-center justify-center">
      <p className="text-beef-light">Loading...</p>
    </div>;
  }

  const isCreator = user?.id === debate.creatorId;
  const isChallenger = user?.id === debate.challengerId;
  const canAccept = debate.status === 'OPEN' && !isCreator;
  const canComment = debate.status === 'ACTIVE' && (isCreator || isChallenger);
  const canBet = debate.status === 'ACTIVE' && !isCreator && !isChallenger;

  return (
    <div className="min-h-screen bg-beef-secondary">
      <nav className="bg-beef-gray border-b border-beef-primary">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="text-beef-primary hover:underline"
          >
            � Back to Feed
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-beef-gray p-6 rounded-lg mb-6">
              <h1 className="text-3xl font-bold text-beef-light mb-4">{debate.topic}</h1>
              {debate.description && (
                <p className="text-gray-400 mb-4">{debate.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm">
                <span className={`px-3 py-1 rounded ${
                  debate.status === 'OPEN' ? 'bg-green-500/20 text-green-400' :
                  debate.status === 'ACTIVE' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {debate.status}
                </span>
                <span className="text-gray-400">=� ${debate.totalPot}</span>
              </div>
            </div>

            <div className="bg-beef-gray p-6 rounded-lg mb-6">
              <h2 className="text-xl font-bold text-beef-primary mb-4">Positions</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Creator: {debate.creator.displayName}</p>
                  <p className="text-beef-light">{debate.creatorPosition}</p>
                </div>
                {debate.challenger ? (
                  <div>
                    <p className="text-sm text-gray-400">Challenger: {debate.challenger.displayName}</p>
                    <p className="text-beef-light">{debate.challengerPosition}</p>
                  </div>
                ) : (
                  canAccept && (
                    <div>
                      <input
                        type="text"
                        value={challengerPosition}
                        onChange={(e) => setChallengerPosition(e.target.value)}
                        placeholder="Enter your position..."
                        className="w-full px-4 py-2 bg-beef-secondary text-beef-light rounded border border-beef-gray focus:border-beef-primary focus:outline-none mb-2"
                      />
                      <button
                        onClick={handleAcceptDebate}
                        className="bg-beef-primary text-white px-6 py-2 rounded font-semibold hover:bg-orange-600 transition"
                      >
                        Accept Debate (${debate.initialAnte})
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="bg-beef-gray p-6 rounded-lg">
              <h2 className="text-xl font-bold text-beef-primary mb-4">Arguments</h2>
              <div className="space-y-4 mb-4">
                {debate.comments.map((c: any) => (
                  <div key={c.id} className="bg-beef-secondary p-4 rounded">
                    <p className="text-sm text-gray-400 mb-1">{c.author.displayName}</p>
                    <p className="text-beef-light">{c.content}</p>
                  </div>
                ))}
                {debate.comments.length === 0 && (
                  <p className="text-gray-400 text-center py-4">No arguments yet</p>
                )}
              </div>

              {canComment && (
                <form onSubmit={handleAddComment}>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add your argument..."
                    className="w-full px-4 py-2 bg-beef-secondary text-beef-light rounded border border-beef-gray focus:border-beef-primary focus:outline-none mb-2"
                    rows={3}
                  />
                  <button
                    type="submit"
                    className="bg-beef-primary text-white px-6 py-2 rounded font-semibold hover:bg-orange-600 transition"
                  >
                    Post Argument
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            {canBet && (
              <div className="bg-beef-gray p-6 rounded-lg mb-6">
                <h2 className="text-xl font-bold text-beef-primary mb-4">Place a Bet</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-beef-light mb-2">Who will win?</label>
                    <select
                      value={selectedWinner}
                      onChange={(e) => setSelectedWinner(e.target.value)}
                      className="w-full px-4 py-2 bg-beef-secondary text-beef-light rounded border border-beef-gray focus:border-beef-primary focus:outline-none"
                    >
                      <option value="">Select winner</option>
                      <option value={debate.creatorId}>{debate.creator.displayName}</option>
                      <option value={debate.challengerId}>{debate.challenger.displayName}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-beef-light mb-2">Amount ($)</label>
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      min="1"
                      step="1"
                      className="w-full px-4 py-2 bg-beef-secondary text-beef-light rounded border border-beef-gray focus:border-beef-primary focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handlePlaceBet}
                    className="w-full bg-beef-primary text-white py-2 rounded font-semibold hover:bg-orange-600 transition"
                  >
                    Place Bet
                  </button>
                </div>
              </div>
            )}

            <div className="bg-beef-gray p-6 rounded-lg">
              <h2 className="text-xl font-bold text-beef-primary mb-4">Betting Pool</h2>
              <div className="space-y-2">
                {debate.bets.map((bet: any) => (
                  <div key={bet.id} className="text-sm text-gray-400">
                    <span>{bet.user.username}</span>
                    <span className="float-right">${bet.amount}</span>
                  </div>
                ))}
                {debate.bets.length === 0 && (
                  <p className="text-gray-400 text-sm">No bets placed yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
