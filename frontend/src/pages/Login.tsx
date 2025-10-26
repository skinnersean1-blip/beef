import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-beef-secondary">
      <div className="bg-beef-gray p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-beef-primary mb-6">🔥 Beef Login</h1>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-beef-secondary text-beef-light rounded border border-beef-gray focus:border-beef-primary focus:outline-none"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-beef-light mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-beef-secondary text-beef-light rounded border border-beef-gray focus:border-beef-primary focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-beef-primary text-white py-2 rounded font-semibold hover:bg-orange-600 transition"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-beef-light">
          Don't have an account?{' '}
          <Link to="/register" className="text-beef-primary hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};
