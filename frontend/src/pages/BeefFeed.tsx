import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { beefAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSwipeable } from 'react-swipeable';

type ViewMode = 'swipe' | 'scroll';

export const BeefFeed: React.FC = () => {
  const [beefs, setBeefs] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('swipe');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [search, setSearch] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadBeefs();
  }, [search]);

  const loadBeefs = async () => {
    try {
      const response = await beefAPI.getBeefs({ search });
      setBeefs(response.data);
    } catch (error) {
      console.error('Failed to load beefs:', error);
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (viewMode === 'swipe' && currentIndex < beefs.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    },
    onSwipedRight: () => {
      if (viewMode === 'swipe' && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    },
    onSwipedUp: () => {
      if (viewMode === 'swipe' && beefs[currentIndex]) {
        navigate(`/beef/${beefs[currentIndex].id}`);
      }
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  const currentBeef = beefs[currentIndex];

  return (
    <div className="min-h-screen bg-beef-white">
      <nav className="bg-beef-mauve-500 text-beef-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">BEEF</h1>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as ViewMode)}
              className="bg-beef-mauve-600 text-beef-white px-3 py-1 rounded border border-beef-white cursor-pointer"
            >
              <option value="swipe">Swipe</option>
              <option value="scroll">Scroll</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-beef-yellow font-bold">${user && user.walletBalance.toFixed(2)}</span>
            <button
              onClick={() => navigate('/create')}
              className="bg-beef-yellow text-beef-black px-4 py-2 rounded font-bold hover:bg-beef-yellow-dark transition"
            >
              Post
            </button>
            <button
              onClick={logout}
              className="text-beef-white hover:underline"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {viewMode === 'swipe' && (
        <div {...handlers} className="h-[calc(100vh-80px)] flex items-center justify-center p-4">
          {currentBeef ? (
            <div className="bg-beef-mauve-100 rounded-lg shadow-2xl p-8 max-w-2xl w-full border-4 border-beef-brown-500">
              <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded font-bold text-sm ${
                  currentBeef.status === 'OPEN' ? 'bg-green-500 text-white' :
                  currentBeef.status === 'ACTIVE' ? 'bg-beef-yellow text-beef-black' :
                  'bg-gray-400 text-white'
                }`}>
                  {currentBeef.status}
                </span>
                <span className="ml-3 text-beef-brown-600 font-bold">${currentBeef.ante}</span>
              </div>
              <h2 className="text-3xl font-bold text-beef-brown-700 mb-4">{currentBeef.topic}</h2>
              <p className="text-beef-brown-600 mb-4">
                <strong>{currentBeef.creator.displayName}:</strong> {currentBeef.creatorPosition}
              </p>
              {currentBeef.challenger && (
                <p className="text-beef-brown-600 mb-4">
                  <strong>{currentBeef.challenger.displayName}:</strong> {currentBeef.challengerPosition}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-beef-brown-500">
                <span>{currentBeef._count.posts} posts</span>
                <span>{currentBeef._count.likes} reactions</span>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => navigate(`/beef/${currentBeef.id}`)}
                  className="flex-1 bg-beef-mauve-500 text-beef-white py-3 rounded font-bold hover:bg-beef-mauve-600 transition"
                >
                  View Details
                </button>
                {currentBeef.status === 'OPEN' && currentBeef.creatorId !== user?.id && (
                  <button
                    onClick={() => navigate(`/beef/${currentBeef.id}`)}
                    className="flex-1 bg-beef-yellow text-beef-black py-3 rounded font-bold hover:bg-beef-yellow-dark transition"
                  >
                    Accept Beef
                  </button>
                )}
              </div>
              <p className="text-center text-beef-brown-400 text-sm mt-6">
                Swipe left/right to navigate
              </p>
              <p className="text-center text-beef-brown-500 font-bold mt-2">
                {currentIndex + 1} / {beefs.length}
              </p>
            </div>
          ) : (
            <div className="text-center text-beef-brown-500">
              <p className="text-xl">No beefs found</p>
              <button
                onClick={() => navigate('/create')}
                className="mt-4 bg-beef-yellow text-beef-black px-6 py-3 rounded font-bold"
              >
                Start the First Beef
              </button>
            </div>
          )}
        </div>
      )}

      {viewMode === 'scroll' && (
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
          {beefs.map((beef) => (
            <div
              key={beef.id}
              onClick={() => navigate(`/beef/${beef.id}`)}
              className="bg-beef-mauve-100 p-6 rounded-lg border-2 border-beef-brown-300 hover:border-beef-mauve-500 cursor-pointer transition shadow-md"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-2xl font-bold text-beef-brown-700">{beef.topic}</h3>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded font-bold text-sm ${
                    beef.status === 'OPEN' ? 'bg-green-500 text-white' :
                    beef.status === 'ACTIVE' ? 'bg-beef-yellow text-beef-black' :
                    'bg-gray-400 text-white'
                  }`}>
                    {beef.status}
                  </span>
                  <span className="text-beef-brown-600 font-bold">${beef.ante}</span>
                </div>
              </div>
              <p className="text-beef-brown-600 mb-2">
                {beef.creator.displayName}
                {beef.challenger && ` vs ${beef.challenger.displayName}`}
              </p>
              <div className="flex items-center gap-4 text-sm text-beef-brown-500">
                <span>{beef._count.posts} posts</span>
                <span>{beef._count.likes} reactions</span>
              </div>
            </div>
          ))}
          {beefs.length === 0 && (
            <div className="text-center text-beef-brown-500 py-12">
              <p className="text-xl">No beefs found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
