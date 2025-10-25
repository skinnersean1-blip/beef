import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DollarSign,
  MessageSquare,
  TrendingUp,
  Clock,
  Send,
  Award,
  AlertCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { debateAPI, commentAPI, betAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import socketService from '../services/socket';
import type { Debate, Comment, DebateStats } from '../types';

const DebateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [debate, setDebate] = useState<Debate | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [stats, setStats] = useState<DebateStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [commentText, setCommentText] = useState('');
  const [commentType, setCommentType] = useState<'ARGUMENT' | 'SPECTATOR'>('SPECTATOR');
  const [betAmount, setBetAmount] = useState(10);
  const [selectedWinner, setSelectedWinner] = useState<string>('');
  const [showBetModal, setShowBetModal] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [debateRes, commentsRes, statsRes] = await Promise.all([
          debateAPI.getDebate(id),
          commentAPI.getComments(id),
          debateAPI.getStats(id),
        ]);

        setDebate(debateRes.data);
        setComments(commentsRes.data);
        setStats(statsRes.data);
      } catch (error) {
        console.error('Failed to fetch debate:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Join socket room
    socketService.joinDebate(id);

    // Listen for real-time updates
    socketService.onCommentAdded((comment) => {
      setComments((prev) => [...prev, comment]);
    });

    socketService.onVoteAdded(() => {
      // Refresh stats when votes change
      debateAPI.getStats(id).then((res) => setStats(res.data));
    });

    return () => {
      socketService.leaveDebate(id);
      socketService.off('comment_added');
      socketService.off('vote_added');
    };
  }, [id]);

  const handleAcceptDebate = async () => {
    if (!id || !debate) return;

    const position = prompt('Enter your position:');
    const ante = prompt(`Enter your ante (min $${debate.initialAnte}):`);

    if (!position || !ante) return;

    try {
      await debateAPI.acceptDebate(id, {
        challengerPosition: position,
        challengerAnte: parseFloat(ante),
      });
      window.location.reload();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to accept debate');
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !commentText.trim()) return;

    try {
      const res = await commentAPI.createComment(id, {
        content: commentText,
        type: commentType,
      });

      socketService.emitNewComment(id, res.data);
      setCommentText('');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to post comment');
    }
  };

  const handlePlaceBet = async () => {
    if (!id || !selectedWinner) return;

    try {
      await betAPI.placeBet(id, {
        amount: betAmount,
        predictedWinner: selectedWinner,
      });
      setShowBetModal(false);
      alert('Bet placed successfully!');
      window.location.reload();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to place bet');
    }
  };

  const handleVote = async (type: string) => {
    if (!id) return;

    try {
      await commentAPI.voteOnDebate(id, type);
      // Refresh stats
      const res = await debateAPI.getStats(id);
      setStats(res.data);
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-beef-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-beef-red"></div>
      </div>
    );
  }

  if (!debate) {
    return (
      <div className="min-h-screen bg-beef-dark flex items-center justify-center">
        <p className="text-white text-xl">Debate not found</p>
      </div>
    );
  }

  const isParticipant =
    user && (user.id === debate.creatorId || user.id === debate.challengerId);

  return (
    <div className="min-h-screen bg-beef-dark pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-beef-red to-red-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-3">
                <span className="px-3 py-1 bg-white text-beef-red rounded-full text-sm font-bold">
                  {debate.status}
                </span>
                <span className="text-white opacity-75">{debate.category}</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">{debate.topic}</h1>
              <p className="text-gray-200">{debate.description}</p>
            </div>
            <div className="text-center ml-6">
              <div className="bg-white rounded-lg p-4">
                <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-1" />
                <div className="text-3xl font-bold text-beef-dark">
                  ${debate.totalPot.toFixed(2)}
                </div>
                <div className="text-xs text-gray-600">Total Pot</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Participants */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-beef-gray rounded-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Creator</p>
                    <p className="text-xl font-bold text-white">
                      {debate.creator.displayName}
                    </p>
                    <p className="text-sm text-gray-400 italic mt-2">
                      {debate.creatorPosition}
                    </p>
                  </div>
                  {stats && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">
                        {stats.engagement.creatorSupport.toFixed(0)}%
                      </div>
                      <button
                        onClick={() => handleVote('SUPPORT_CREATOR')}
                        className="text-xs text-beef-red hover:underline mt-1"
                      >
                        Support
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-beef-gray rounded-lg p-6">
                {debate.challenger ? (
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Challenger</p>
                      <p className="text-xl font-bold text-white">
                        {debate.challenger.displayName}
                      </p>
                      <p className="text-sm text-gray-400 italic mt-2">
                        {debate.challengerPosition}
                      </p>
                    </div>
                    {stats && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-500">
                          {stats.engagement.challengerSupport.toFixed(0)}%
                        </div>
                        <button
                          onClick={() => handleVote('SUPPORT_CHALLENGER')}
                          className="text-xs text-beef-red hover:underline mt-1"
                        >
                          Support
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400">Waiting for challenger...</p>
                    {user && user.id !== debate.creatorId && (
                      <button
                        onClick={handleAcceptDebate}
                        className="mt-4 bg-beef-red text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
                      >
                        Accept Challenge
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-beef-gray rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Discussion ({comments.length})
              </h2>

              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-4 rounded-lg ${
                      comment.type === 'SPECTATOR'
                        ? 'bg-beef-dark'
                        : 'bg-blue-900 bg-opacity-20 border border-blue-500'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-white font-semibold">
                          {comment.author.displayName}
                        </span>
                        <span className="text-gray-400 text-xs ml-2">
                          {formatDistanceToNow(new Date(comment.createdAt))} ago
                        </span>
                      </div>
                      <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
                        {comment.type}
                      </span>
                    </div>
                    <p className="text-gray-300">{comment.content}</p>
                  </div>
                ))}
              </div>

              {user && (
                <form onSubmit={handlePostComment} className="space-y-3">
                  <div className="flex items-center space-x-2">
                    {isParticipant && (
                      <select
                        value={commentType}
                        onChange={(e) => setCommentType(e.target.value as any)}
                        className="bg-beef-dark text-white rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="ARGUMENT">Argument</option>
                        <option value="REBUTTAL">Rebuttal</option>
                        <option value="EVIDENCE">Evidence</option>
                        <option value="SPECTATOR">Comment</option>
                      </select>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Share your thoughts..."
                      className="flex-1 bg-beef-dark text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-beef-red"
                    />
                    <button
                      type="submit"
                      className="bg-beef-red text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            {stats && (
              <div className="bg-beef-gray rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Votes</span>
                    <span className="text-white font-semibold">
                      {stats.engagement.totalVotes}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Comments</span>
                    <span className="text-white font-semibold">
                      {stats.comments.total}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Bets</span>
                    <span className="text-white font-semibold">
                      ${stats.betting.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Betting */}
            {user && debate.status === 'ACTIVE' && !isParticipant && (
              <div className="bg-beef-gray rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Place a Bet
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Pick Winner
                    </label>
                    <select
                      value={selectedWinner}
                      onChange={(e) => setSelectedWinner(e.target.value)}
                      className="w-full bg-beef-dark text-white rounded-lg px-3 py-2"
                    >
                      <option value="">Select...</option>
                      <option value={debate.creatorId}>
                        {debate.creator.displayName}
                      </option>
                      {debate.challenger && (
                        <option value={debate.challengerId}>
                          {debate.challenger.displayName}
                        </option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Amount</label>
                    <input
                      type="number"
                      min="1"
                      value={betAmount}
                      onChange={(e) => setBetAmount(parseFloat(e.target.value))}
                      className="w-full bg-beef-dark text-white rounded-lg px-3 py-2"
                    />
                  </div>
                  <button
                    onClick={handlePlaceBet}
                    disabled={!selectedWinner}
                    className="w-full bg-beef-red text-white py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  >
                    Place Bet
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebateDetail;
