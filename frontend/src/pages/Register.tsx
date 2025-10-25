import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        displayName: formData.displayName,
      });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-beef-dark flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Flame className="w-12 h-12 text-beef-red" />
            <span className="text-4xl font-bold text-white">Beef</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Join the Debate</h2>
          <p className="text-gray-400 mt-2">Create your account and get $100 to start</p>
        </div>

        <div className="bg-beef-gray rounded-lg p-8">
          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white font-semibold mb-2">Display Name</label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                className="w-full bg-beef-dark text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-beef-red"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full bg-beef-dark text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-beef-red"
                placeholder="johndoe"
                required
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-beef-dark text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-beef-red"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full bg-beef-dark text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-beef-red"
                placeholder="At least 6 characters"
                required
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="w-full bg-beef-dark text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-beef-red"
                placeholder="Confirm your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-beef-red text-white font-bold py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50 mt-6"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-beef-red hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
