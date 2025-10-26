import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    displayName: '',
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-beef-secondary">
      <div className="bg-beef-gray p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-beef-primary mb-6">🔥 Join Beef</h1>
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-beef-light mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-beef-secondary text-beef-light rounded border border-beef-gray focus:border-beef-primary focus:outline-none"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-beef-light mb-2">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-beef-secondary text-beef-light rounded border border-beef-gray focus:border-beef-primary focus:outline-none"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-beef-light mb-2">Display Name</label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-beef-secondary text-beef-light rounded border border-beef-gray focus:border-beef-primary focus:outline-none"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-beef-light mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-beef-secondary text-beef-light rounded border border-beef-gray focus:border-beef-primary focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-beef-primary text-white py-2 rounded font-semibold hover:bg-orange-600 transition"
          >
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-beef-light">
          Already have an account?{' '}
          <Link to="/login" className="text-beef-primary hover:underline">
            Login
          </Link>
        </p>
        <p className="mt-4 text-xs text-center text-gray-500">
          You must be 18+ to place bets. By registering, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
};
