import React, { useState } from 'react';
import { X } from 'lucide-react';
import { debateAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface CreateDebateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  'Politics',
  'Technology',
  'Sports',
  'Entertainment',
  'Science',
  'Philosophy',
  'Economics',
  'Social Issues',
  'Other',
];

const CreateDebateModal: React.FC<CreateDebateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    topic: '',
    description: '',
    category: 'Politics',
    initialAnte: 10,
    creatorPosition: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('You must be logged in to create a debate');
      return;
    }

    if (formData.initialAnte > user.walletBalance) {
      setError('Insufficient wallet balance');
      return;
    }

    setLoading(true);

    try {
      await debateAPI.createDebate(formData);
      onSuccess();
      onClose();
      setFormData({
        topic: '',
        description: '',
        category: 'Politics',
        initialAnte: 10,
        creatorPosition: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create debate');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-beef-dark rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Create New Debate</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-beef-gray rounded-lg transition"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-500 rounded-lg p-4 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white font-semibold mb-2">
              Debate Topic *
            </label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              className="w-full bg-beef-gray text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-beef-red"
              placeholder="e.g., Is remote work better than office work?"
              required
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-beef-gray text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-beef-red h-32"
              placeholder="Provide context and rules for the debate..."
              required
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">
              Your Position *
            </label>
            <input
              type="text"
              value={formData.creatorPosition}
              onChange={(e) =>
                setFormData({ ...formData, creatorPosition: e.target.value })
              }
              className="w-full bg-beef-gray text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-beef-red"
              placeholder="e.g., Remote work is more productive"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-semibold mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-beef-gray text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-beef-red"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Initial Ante ($)
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={formData.initialAnte}
                onChange={(e) =>
                  setFormData({ ...formData, initialAnte: parseFloat(e.target.value) })
                }
                className="w-full bg-beef-gray text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-beef-red"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Your balance: ${user?.walletBalance.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-beef-gray text-white rounded-lg hover:bg-opacity-80 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-beef-red text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Debate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDebateModal;
