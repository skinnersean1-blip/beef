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
    <div className="min-h-screen flex items-center justify-center bg-beef">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h1 className="text-6xl font-bold text-beef mb-8 text-center tracking-wider">BEEF</h1>
        <p className="text-beef mb-6 text-center text-lg">Login to your account</p>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-beef mb-2 font-semibold">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:border-beef focus:outline-none"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-beef mb-2 font-semibold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:border-beef focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-white text-beef py-3 rounded-lg font-bold border-2 border-beef hover:bg-beef hover:text-white transition"
          >
            Login
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-beef mb-2">
            Don't have an account?{' '}
            <Link to="/register" className="text-beef hover:underline font-bold">
              Register
            </Link>
          </p>
          <button
            type="button"
            onClick={() => alert('Password recovery feature coming soon! Please contact support.')}
            className="text-beef text-sm hover:underline"
          >
            Forgot password?
          </button>
        </div>
      </div>
    </div>
  );
};
