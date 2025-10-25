import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Flame, User, LogOut, Wallet, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-beef-dark border-b border-beef-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Flame className="w-8 h-8 text-beef-red" />
            <span className="text-2xl font-bold text-white">Beef</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search debates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-beef-gray text-white rounded-full px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-beef-red"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
          </form>

          {/* User Menu */}
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-beef-gray px-4 py-2 rounded-lg">
                <Wallet className="w-5 h-5 text-green-500" />
                <span className="text-white font-semibold">
                  ${user.walletBalance.toFixed(2)}
                </span>
              </div>

              <Link
                to="/responsible-gaming"
                className="p-2 hover:bg-beef-gray rounded-lg transition"
                title="Responsible Gaming & Help"
              >
                <Heart className="w-5 h-5 text-red-500" />
              </Link>

              <Link
                to="/profile"
                className="flex items-center space-x-2 hover:bg-beef-gray px-3 py-2 rounded-lg transition"
              >
                <User className="w-5 h-5 text-white" />
                <span className="text-white">{user.displayName}</span>
              </Link>

              <button
                onClick={logout}
                className="p-2 hover:bg-beef-gray rounded-lg transition"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-white" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/responsible-gaming"
                className="text-white hover:text-beef-red transition flex items-center space-x-1"
                title="Responsible Gaming"
              >
                <Heart className="w-4 h-4" />
                <span>Help</span>
              </Link>
              <Link
                to="/login"
                className="text-white hover:text-beef-red transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-beef-red text-white px-6 py-2 rounded-full hover:bg-red-700 transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
