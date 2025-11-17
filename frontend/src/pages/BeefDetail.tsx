import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { beefAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const BeefDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [beef, setBeef] = useState<any>(null);
  const [post, setPost] = useState('');
  const [challengerPosition, setChallengerPosition] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) loadBeef();
  }, [id]);

  const loadBeef = async () => {
    try {
      const response = await beefAPI.getBeef(id!);
      setBeef(response.data);
    } catch (error) {
      console.error('Failed to load beef:', error);
    }
  };

  const handleAccept = async () => {
    if (!challengerPosition) {
      alert('Please enter your position');
      return;
    }
    try {
      await beefAPI.acceptBeef(id!, { challengerPosition });
      loadBeef();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to accept beef');
    }
  };

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post.trim()) return;

    const wordCount = post.trim().split(/\s+/).length;
    if (wordCount > 500) {
      alert('Maximum 500 words per post');
      return;
    }

    try {
      await beefAPI.addPost(id!, { content: post });
      setPost('');
      loadBeef();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to add post');
    }
  };

  const handleConcede = async () => {
    if (confirm('Are you sure you want to concede this beef?')) {
      try {
        await beefAPI.concede(id!);
        loadBeef();
      } catch (error: any) {
        alert(error.response?.data?.error || 'Failed to concede');
      }
    }
  };

  const handleWithdraw = async () => {
    if (confirm('Withdraw this beef?')) {
      try {
        await beefAPI.withdrawBeef(id!);
        navigate('/');
      } catch (error: any) {
        alert(error.response?.data?.error || 'Failed to withdraw');
      }
    }
  };

  const handleLike = async (isLike: boolean) => {
    try {
      await beefAPI.toggleLike(id!, isLike);
      loadBeef();
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  if (!beef) {
    return <div className="min-h-screen bg-beef-white flex items-center justify-center">
      <p className="text-beef-brown-500 text-xl">Loading...</p>
    </div>;
  }

  const isCreator = user?.id === beef.creatorId;
  const isChallenger = user?.id === beef.challengerId;
  const isParticipant = isCreator || isChallenger;
  const canAccept = beef.status === 'OPEN' && !isCreator;
  const canPost = beef.status === 'ACTIVE' && isParticipant;
  const canConcede = beef.status === 'ACTIVE' && isParticipant;
  const canWithdraw = beef.status === 'OPEN' && isCreator;

  return (
    <div className="min-h-screen bg-beef-white">
      <nav className="bg-beef-mauve-500 text-beef-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="text-beef-white hover:underline font-semibold"
          >
            ê Back to Feed
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Beef Header */}
            <div className="bg-beef-mauve-100 p-6 rounded-lg mb-6 border-2 border-beef-brown-500 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-beef-brown-700">{beef.topic}</h1>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded font-bold ${
                    beef.status === 'OPEN' ? 'bg-green-500 text-white' :
                    beef.status === 'ACTIVE' ? 'bg-beef-yellow text-beef-black' :
                    'bg-gray-400 text-white'
                  }`}>
                    {beef.status}
                  </span>
                  <span className="text-beef-brown-600 font-bold text-xl">${beef.ante}</span>
                </div>
              </div>

              {/* Positions */}
              <div className="space-y-4">
                <div className="bg-beef-white p-4 rounded border border-beef-brown-300">
                  <p className="text-sm text-beef-brown-500 font-semibold">
                    {beef.creator.displayName}
                  </p>
                  <p className="text-beef-brown-700">{beef.creatorPosition}</p>
                </div>

                {beef.challenger ? (
                  <div className="bg-beef-white p-4 rounded border border-beef-brown-300">
                    <p className="text-sm text-beef-brown-500 font-semibold">
                      {beef.challenger.displayName}
                    </p>
                    <p className="text-beef-brown-700">{beef.challengerPosition}</p>
                  </div>
                ) : canAccept && (
                  <div className="bg-beef-yellow/20 p-4 rounded border-2 border-beef-yellow">
                    <textarea
                      value={challengerPosition}
                      onChange={(e) => setChallengerPosition(e.target.value)}
                      placeholder="Enter your position..."
                      className="w-full px-4 py-2 border-2 border-beef-brown-300 rounded focus:border-beef-mauve-500 focus:outline-none mb-3"
                      rows={3}
                    />
                    <button
                      onClick={handleAccept}
                      className="w-full bg-beef-yellow text-beef-black py-3 rounded font-bold hover:bg-beef-yellow-dark transition"
                    >
                      Accept Beef (${beef.ante})
                    </button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                {canWithdraw && (
                  <button
                    onClick={handleWithdraw}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Withdraw
                  </button>
                )}
                {canConcede && (
                  <button
                    onClick={handleConcede}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Concede
                  </button>
                )}
              </div>
            </div>

            {/* Posts */}
            <div className="bg-beef-mauve-100 p-6 rounded-lg border-2 border-beef-brown-500 shadow-lg">
              <h2 className="text-2xl font-bold text-beef-brown-700 mb-4">Arguments</h2>

              <div className="space-y-4 mb-6">
                {beef.posts.map((p: any) => (
                  <div key={p.id} className="bg-beef-white p-4 rounded border border-beef-brown-300">
                    <p className="text-sm text-beef-brown-500 font-semibold mb-2">
                      {p.author.displayName} " {p.wordCount} words
                    </p>
                    <p className="text-beef-brown-700 whitespace-pre-wrap">{p.content}</p>
                  </div>
                ))}
                {beef.posts.length === 0 && (
                  <p className="text-beef-brown-500 text-center py-8">No arguments yet</p>
                )}
              </div>

              {canPost && (
                <form onSubmit={handleAddPost}>
                  <textarea
                    value={post}
                    onChange={(e) => setPost(e.target.value)}
                    placeholder="Add your argument (max 500 words)..."
                    className="w-full px-4 py-3 border-2 border-beef-brown-300 rounded focus:border-beef-mauve-500 focus:outline-none mb-3"
                    rows={4}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-beef-brown-500">
                      {post.trim().split(/\s+/).filter(w => w).length} / 500 words
                    </span>
                    <button
                      type="submit"
                      className="bg-beef-mauve-500 text-beef-white px-6 py-2 rounded font-bold hover:bg-beef-mauve-600"
                    >
                      Post Argument
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Reactions */}
            <div className="bg-beef-mauve-100 p-6 rounded-lg border-2 border-beef-brown-500 shadow-lg mb-6">
              <h2 className="text-xl font-bold text-beef-brown-700 mb-4">Reactions</h2>
              <div className="flex gap-4">
                <button
                  onClick={() => handleLike(true)}
                  className="flex-1 bg-green-500 text-white py-3 rounded font-bold hover:bg-green-600"
                >
                  Like {beef.likes.filter((l: any) => l.isLike).length}
                </button>
                <button
                  onClick={() => handleLike(false)}
                  className="flex-1 bg-red-500 text-white py-3 rounded font-bold hover:bg-red-600"
                >
                  Dislike {beef.likes.filter((l: any) => !l.isLike).length}
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-beef-mauve-100 p-6 rounded-lg border-2 border-beef-brown-500 shadow-lg">
              <h2 className="text-xl font-bold text-beef-brown-700 mb-4">Stats</h2>
              <div className="space-y-2 text-beef-brown-600">
                <p><strong>Total Pot:</strong> ${beef.ante * 2}</p>
                <p><strong>Arguments:</strong> {beef.posts.length}</p>
                <p><strong>Reactions:</strong> {beef.likes.length}</p>
                {beef.endsAt && (
                  <p><strong>Ends:</strong> {new Date(beef.endsAt).toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
