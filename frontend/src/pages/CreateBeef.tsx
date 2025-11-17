import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { beefAPI } from '../services/api';

export const CreateBeef: React.FC = () => {
  const [formData, setFormData] = useState({
    topic: '',
    creatorPosition: '',
    ante: '10',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await beefAPI.createBeef({
        ...formData,
        ante: parseFloat(formData.ante),
      });
      navigate(`/beef/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create beef');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-beef-brown-500 mb-6">Start a Beef</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="bg-beef-mauve-100 p-8 rounded-lg shadow-lg border-2 border-beef-brown-500">
          <div className="mb-6">
            <label className="block text-beef-brown-700 mb-2 font-bold text-lg">
              What's the Topic?
            </label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              placeholder="e.g., Is pineapple acceptable on pizza?"
              className="w-full px-4 py-3 border-2 border-beef-brown-300 rounded focus:border-beef-mauve-500 focus:outline-none text-lg"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-beef-brown-700 mb-2 font-bold text-lg">
              Your Position
            </label>
            <textarea
              name="creatorPosition"
              value={formData.creatorPosition}
              onChange={handleChange}
              placeholder="State your position clearly..."
              className="w-full px-4 py-3 border-2 border-beef-brown-300 rounded focus:border-beef-mauve-500 focus:outline-none h-32 text-lg"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-beef-brown-700 mb-2 font-bold text-lg">
              Ante Amount ($)
            </label>
            <input
              type="number"
              name="ante"
              value={formData.ante}
              onChange={handleChange}
              min="1"
              max="1000"
              step="1"
              className="w-full px-4 py-3 border-2 border-beef-brown-300 rounded focus:border-beef-mauve-500 focus:outline-none text-lg"
              required
            />
            <p className="text-sm text-beef-brown-500 mt-2">
              Your challenger must match this amount. Max $1,000.
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-beef-yellow text-beef-black py-4 rounded font-bold text-xl hover:bg-beef-yellow-dark transition shadow-lg"
          >
            Post Beef
          </button>
        </form>
      </div>
    </div>
  );
};
