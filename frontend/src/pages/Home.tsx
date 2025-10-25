import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import { debateAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DebateCard from '../components/DebateCard';
import CreateDebateModal from '../components/CreateDebateModal';
import type { Debate } from '../types';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [debates, setDebates] = useState<Debate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const searchQuery = searchParams.get('search') || '';

  const fetchDebates = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (searchQuery) params.search = searchQuery;

      const response = await debateAPI.getDebates(params);
      setDebates(response.data.debates);
    } catch (error) {
      console.error('Failed to fetch debates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebates();
  }, [statusFilter, categoryFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-beef-dark">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-beef-red to-red-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-4">
              Welcome to Beef
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              The algorithm-free debate platform where arguments meet action
            </p>
            {user && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center space-x-2 bg-white text-beef-red px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition text-lg"
              >
                <Plus className="w-6 h-6" />
                <span>Create Debate</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-white" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-beef-gray text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-beef-red"
              >
                <option value="all">All Status</option>
                <option value="OPEN">Open</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-beef-gray text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-beef-red"
            >
              <option value="all">All Categories</option>
              <option value="Politics">Politics</option>
              <option value="Technology">Technology</option>
              <option value="Sports">Sports</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Science">Science</option>
              <option value="Philosophy">Philosophy</option>
              <option value="Economics">Economics</option>
              <option value="Social Issues">Social Issues</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {searchQuery && (
            <p className="text-gray-400">
              Search results for: <span className="text-white font-semibold">{searchQuery}</span>
            </p>
          )}
        </div>

        {/* Debates Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-beef-red"></div>
            <p className="text-gray-400 mt-4">Loading debates...</p>
          </div>
        ) : debates.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No debates found</p>
            {user && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 text-beef-red hover:underline"
              >
                Create the first one!
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {debates.map((debate) => (
              <DebateCard key={debate.id} debate={debate} />
            ))}
          </div>
        )}
      </div>

      <CreateDebateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchDebates}
      />
    </div>
  );
};

export default Home;
