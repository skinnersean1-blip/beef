import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, AlertTriangle, Shield, Heart } from 'lucide-react';
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
    dateOfBirth: '',
  });
  const [agreements, setAgreements] = useState({
    ageVerified: false,
    termsAccepted: false,
    responsibleGaming: false,
    gamblingDisclaimer: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Date of birth validation (required but don't block under-18)
    if (!formData.dateOfBirth) {
      setError('Date of birth is required');
      return;
    }

    // Check terms acceptance (required for all users)
    if (!agreements.termsAccepted) {
      setError('You must accept the Terms of Service');
      return;
    }

    // For 18+ users, require gambling-specific agreements
    const age = calculateAge(formData.dateOfBirth);
    if (age >= 18) {
      if (!agreements.ageVerified) {
        setError('You must verify that you are at least 18 years old');
        return;
      }

      if (!agreements.responsibleGaming) {
        setError('You must acknowledge the Responsible Gaming policy');
        return;
      }

      if (!agreements.gamblingDisclaimer) {
        setError('You must acknowledge the gambling disclaimer');
        return;
      }
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

  const userAge = formData.dateOfBirth ? calculateAge(formData.dateOfBirth) : null;
  const isOver18 = userAge !== null && userAge >= 18;
  const isUnder18 = userAge !== null && userAge < 18;

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

        {/* Warning Banner */}
        <div className="bg-yellow-900 bg-opacity-30 border-2 border-yellow-600 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-yellow-500 font-bold mb-2">Gambling Warning (18+ to Bet)</h3>
              <p className="text-yellow-200 text-sm">
                This platform contains gambling mechanics. You must be at least 18 years old to place bets or wagers.
                Users under 18 can view content but cannot participate in betting. Gambling can be addictive - please gamble responsibly.
              </p>
            </div>
          </div>
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
              <label className="block text-white font-semibold mb-2">
                Date of Birth *
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
                max={new Date().toISOString().split('T')[0]}
                className="w-full bg-beef-dark text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-beef-red"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Must be 18+ to place bets. Under 18 can view debates only.
              </p>
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

            {/* Legal Agreements Section */}
            <div className="border-t border-gray-600 pt-6 mt-6 space-y-4">
              <h3 className="text-white font-bold text-lg mb-4">Required Acknowledgments</h3>

              {/* Terms of Service - Always Required */}
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreements.termsAccepted}
                  onChange={(e) =>
                    setAgreements({ ...agreements, termsAccepted: e.target.checked })
                  }
                  className="mt-1 w-5 h-5 text-beef-red bg-beef-dark border-gray-600 rounded focus:ring-beef-red"
                  required
                />
                <span className="text-white text-sm">
                  I have read and agree to the{' '}
                  <a
                    href="/terms"
                    target="_blank"
                    className="text-beef-red hover:underline"
                  >
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a
                    href="/privacy"
                    target="_blank"
                    className="text-beef-red hover:underline"
                  >
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>

              {/* Gambling-Specific Agreements (Only shown if 18+) */}
              {isOver18 && (
                <>
                  <div className="bg-blue-900 bg-opacity-20 border border-blue-600 rounded-lg p-3 my-4">
                    <p className="text-blue-300 text-sm">
                      <Shield className="w-4 h-4 inline mr-1" />
                      Since you are 18+, the following gambling-related agreements are required:
                    </p>
                  </div>

                  {/* Age Verification */}
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreements.ageVerified}
                      onChange={(e) =>
                        setAgreements({ ...agreements, ageVerified: e.target.checked })
                      }
                      className="mt-1 w-5 h-5 text-beef-red bg-beef-dark border-gray-600 rounded focus:ring-beef-red"
                      required
                    />
                    <span className="text-white text-sm">
                      <Shield className="w-4 h-4 inline mr-1 text-green-500" />
                      I confirm that I am <strong>at least 18 years old</strong> and legally
                      able to participate in gambling activities in my jurisdiction.
                    </span>
                  </label>

                  {/* Gambling Disclaimer */}
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreements.gamblingDisclaimer}
                      onChange={(e) =>
                        setAgreements({
                          ...agreements,
                          gamblingDisclaimer: e.target.checked,
                        })
                      }
                      className="mt-1 w-5 h-5 text-beef-red bg-beef-dark border-gray-600 rounded focus:ring-beef-red"
                      required
                    />
                    <span className="text-white text-sm">
                      <AlertTriangle className="w-4 h-4 inline mr-1 text-yellow-500" />
                      I understand that this platform involves{' '}
                      <strong>gambling with virtual currency</strong>, outcomes are
                      uncertain, and I may lose my balance. I understand gambling can be
                      addictive.
                    </span>
                  </label>

                  {/* Responsible Gaming */}
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreements.responsibleGaming}
                      onChange={(e) =>
                        setAgreements({
                          ...agreements,
                          responsibleGaming: e.target.checked,
                        })
                      }
                      className="mt-1 w-5 h-5 text-beef-red bg-beef-dark border-gray-600 rounded focus:ring-beef-red"
                      required
                    />
                    <span className="text-white text-sm">
                      <Heart className="w-4 h-4 inline mr-1 text-red-500" />
                      I acknowledge the{' '}
                      <a
                        href="/responsible-gaming"
                        target="_blank"
                        className="text-beef-red hover:underline"
                      >
                        Responsible Gaming Policy
                      </a>{' '}
                      and agree to gamble responsibly. If I need help, I will seek support
                      (National Helpline: 1-800-522-4700).
                    </span>
                  </label>
                </>
              )}

              {/* Under 18 Notice */}
              {isUnder18 && (
                <div className="bg-yellow-900 bg-opacity-20 border border-yellow-600 rounded-lg p-4">
                  <p className="text-yellow-300 text-sm">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    You are under 18. You can create an account to view debates and discussions,
                    but you will not be able to place bets, create debates with antes, or participate
                    in gambling activities until you turn 18.
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-beef-red text-white font-bold py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50 mt-6"
            >
              {loading ? 'Creating Account...' : 'Create Account & Start Debating'}
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
