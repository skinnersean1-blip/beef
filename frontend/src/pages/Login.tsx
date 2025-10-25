import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-beef-dark flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Flame className="w-12 h-12 text-beef-red" />
            <span className="text-4xl font-bold text-white">Beef</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-gray-400 mt-2">Login to start debating</p>
        </div>

        <div className="bg-beef-gray rounded-lg p-8">
          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white font-semibold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-beef-dark text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-beef-red"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-beef-dark text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-beef-red"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-beef-red text-white font-bold py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-beef-red hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
