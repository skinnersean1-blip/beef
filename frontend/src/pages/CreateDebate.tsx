import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { debateAPI } from '../services/api';

export const CreateDebate: React.FC = () => {
  const [formData, setFormData] = useState({
    topic: '',
    description: '',
    creatorPosition: '',
    initialAnte: '10',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await debateAPI.createDebate({
        ...formData,
        initialAnte: parseFloat(formData.initialAnte),
      });
      navigate(`/debate/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create debate');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-beef-secondary">
      <nav className="bg-beef-gray border-b border-beef-primary">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="text-beef-primary hover:underline"
          >
            ê Back to Feed
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-beef-primary mb-6">=% Start a Beef</h1>
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="bg-beef-gray p-6 rounded-lg">
          <div className="mb-4">
            <label className="block text-beef-light mb-2 font-semibold">Debate Topic *</label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              placeholder="e.g., Is pineapple acceptable on pizza?"
              className="w-full px-4 py-2 bg-beef-secondary text-beef-light rounded border border-beef-gray focus:border-beef-primary focus:outline-none"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-beef-light mb-2 font-semibold">Description (optional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add any context or rules..."
              className="w-full px-4 py-2 bg-beef-secondary text-beef-light rounded border border-beef-gray focus:border-beef-primary focus:outline-none h-24"
            />
          </div>

          <div className="mb-4">
            <label className="block text-beef-light mb-2 font-semibold">Your Position *</label>
            <input
              type="text"
              name="creatorPosition"
              value={formData.creatorPosition}
              onChange={handleChange}
              placeholder="e.g., Yes, pineapple belongs on pizza"
              className="w-full px-4 py-2 bg-beef-secondary text-beef-light rounded border border-beef-gray focus:border-beef-primary focus:outline-none"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-beef-light mb-2 font-semibold">Initial Ante ($) *</label>
            <input
              type="number"
              name="initialAnte"
              value={formData.initialAnte}
              onChange={handleChange}
              min="1"
              step="1"
              className="w-full px-4 py-2 bg-beef-secondary text-beef-light rounded border border-beef-gray focus:border-beef-primary focus:outline-none"
              required
            />
            <p className="text-sm text-gray-400 mt-1">
              Your challenger must match this amount to accept the debate
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-beef-primary text-white py-3 rounded font-semibold hover:bg-orange-600 transition"
          >
            Create Debate
          </button>
        </form>
      </div>
    </div>
  );
};
