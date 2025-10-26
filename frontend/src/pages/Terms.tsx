import React from 'react';
import { Link } from 'react-router-dom';

export const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-beef-secondary">
      <nav className="bg-beef-gray border-b border-beef-primary">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link to="/" className="text-beef-primary hover:underline">
            ê Back
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-beef-primary mb-6">Terms of Service</h1>
        <div className="bg-beef-gray p-8 rounded-lg text-beef-light space-y-6 leading-relaxed">
          <p className="text-sm text-gray-400">Last Updated: January 2025</p>

          <section>
            <h2 className="text-2xl font-bold text-beef-primary mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Beef ("the Platform"), you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-beef-primary mb-3">2. Eligibility</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>You must be at least 18 years old to use this Platform</li>
              <li>You must be legally permitted to participate in wagering activities in your jurisdiction</li>
              <li>You are responsible for ensuring your use complies with local laws</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-beef-primary mb-3">3. Account Registration</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>You must provide accurate and complete information</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You may not share your account credentials</li>
              <li>One account per person</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-beef-primary mb-3">4. Virtual Currency and Real Money</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>The Platform uses a virtual currency system for wagering</li>
              <li>Real money deposits and withdrawals are available via Stripe</li>
              <li>You are responsible for any taxes on winnings</li>
              <li>Minimum deposit: $10</li>
              <li>Minimum withdrawal: $25</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-beef-primary mb-3">5. Prohibited Conduct</h2>
            <p className="mb-2">You agree NOT to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Use bots or automated systems</li>
              <li>Manipulate voting or betting outcomes</li>
              <li>Harass or abuse other users</li>
              <li>Post illegal, harmful, or offensive content</li>
              <li>Attempt to exploit or hack the Platform</li>
              <li>Create multiple accounts</li>
              <li>Launder money or engage in fraudulent activity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-beef-primary mb-3">6. Responsible Gaming</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Set personal deposit limits</li>
              <li>Take breaks if gaming becomes problematic</li>
              <li>Seek help if needed: 1-800-522-4700 (National Problem Gambling Helpline)</li>
              <li>Self-exclusion options are available upon request</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-beef-primary mb-3">7. Limitation of Liability</h2>
            <p className="font-semibold mb-2">
              THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. BEEF IS NOT LIABLE FOR:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Lost winnings or profits</li>
              <li>Technical failures or interruptions</li>
              <li>Unauthorized access to your account</li>
              <li>Damages exceeding the amount in your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-beef-primary mb-3">8. Contact</h2>
            <p>For questions about these Terms, contact us at: support@beefplatform.com</p>
          </section>

          <div className="border-t border-beef-primary pt-6 mt-8">
            <p className="font-semibold">
              By using the Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
