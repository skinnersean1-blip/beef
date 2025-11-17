import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    displayName: '',
    phone: '',
    tosAccepted: false,
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tosAccepted) {
      setError('You must accept the Terms of Service');
      return;
    }
    try {
      await register(formData);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-beef-white py-8">
      <div className="bg-beef-mauve-100 p-8 rounded-lg shadow-lg w-full max-w-md border-2 border-beef-brown-500">
        <h1 className="text-4xl font-bold text-beef-brown-500 mb-6 text-center">BEEF</h1>
        <p className="text-beef-brown-400 mb-6 text-center">Create your account</p>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-beef-brown-700 mb-2 font-semibold">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-beef-brown-300 rounded focus:border-beef-mauve-500 focus:outline-none"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-beef-brown-700 mb-2 font-semibold">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-beef-brown-300 rounded focus:border-beef-mauve-500 focus:outline-none"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-beef-brown-700 mb-2 font-semibold">Display Name</label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-beef-brown-300 rounded focus:border-beef-mauve-500 focus:outline-none"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-beef-brown-700 mb-2 font-semibold">Phone (Optional)</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-beef-brown-300 rounded focus:border-beef-mauve-500 focus:outline-none"
            />
          </div>
          <div className="mb-4">
            <label className="block text-beef-brown-700 mb-2 font-semibold">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-beef-brown-300 rounded focus:border-beef-mauve-500 focus:outline-none"
              required
            />
          </div>
          <div className="mb-6">
            <label className="flex items-start gap-2 text-sm text-beef-brown-700 cursor-pointer">
              <input
                type="checkbox"
                name="tosAccepted"
                checked={formData.tosAccepted}
                onChange={handleChange}
                className="mt-1"
                required
              />
              <span>
                I am at least 18 years old and accept the Terms of Service
              </span>
            </label>
          </div>
          <button
            type="submit"
            className="w-full bg-beef-mauve-500 text-beef-white py-3 rounded font-bold hover:bg-beef-mauve-600 transition"
          >
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-beef-brown-600">
          Already have an account?{' '}
          <Link to="/login" className="text-beef-mauve-500 hover:underline font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};
