import React from 'react';
import { Heart, Phone, AlertTriangle, Shield, ExternalLink } from 'lucide-react';

const ResponsibleGaming: React.FC = () => {
  return (
    <div className="min-h-screen bg-beef-dark py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Heart className="w-16 h-16 text-beef-red mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-4">Responsible Gaming</h1>
          <p className="text-xl text-gray-400">
            We're committed to providing a safe and enjoyable experience
          </p>
        </div>

        {/* Emergency Help Banner */}
        <div className="bg-red-900 bg-opacity-30 border-2 border-red-600 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-4">
            <Phone className="w-8 h-8 text-red-500 flex-shrink-0" />
            <div>
              <h2 className="text-red-500 font-bold text-xl mb-2">
                Need Help Now?
              </h2>
              <p className="text-white mb-4">
                If you or someone you know has a gambling problem, help is available 24/7:
              </p>
              <div className="space-y-2">
                <p className="text-white font-bold text-2xl">
                  1-800-522-4700
                </p>
                <p className="text-gray-300">National Council on Problem Gambling</p>
                <p className="text-gray-400 text-sm">
                  Free, confidential, available 24/7
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Warning Signs */}
        <div className="bg-beef-gray rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <AlertTriangle className="w-6 h-6 mr-2 text-yellow-500" />
            Warning Signs of Problem Gambling
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'Spending more time or money than intended',
              'Feeling the need to bet with increasing amounts',
              'Feeling restless or irritable when trying to cut back',
              'Gambling to escape problems or feelings',
              'Lying to others about gambling',
              'Jeopardizing relationships due to gambling',
              'Relying on others for money after gambling losses',
              'Repeated unsuccessful attempts to stop',
            ].map((sign, i) => (
              <div key={i} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-beef-red rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-300">{sign}</p>
              </div>
            ))}
          </div>
          <p className="text-yellow-500 mt-6 font-semibold">
            If you recognize these signs in yourself or someone you know, please seek help.
          </p>
        </div>

        {/* Resources */}
        <div className="bg-beef-gray rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Help Resources</h2>

          <div className="space-y-6">
            {/* US Resources */}
            <div>
              <h3 className="text-xl font-bold text-beef-red mb-3">United States</h3>
              <div className="space-y-3">
                <div className="bg-beef-dark p-4 rounded-lg">
                  <p className="text-white font-semibold">National Council on Problem Gambling</p>
                  <p className="text-gray-400">Hotline: 1-800-522-4700</p>
                  <a
                    href="https://www.ncpgambling.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-beef-red hover:underline inline-flex items-center mt-2"
                  >
                    Visit Website <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </div>

                <div className="bg-beef-dark p-4 rounded-lg">
                  <p className="text-white font-semibold">Gamblers Anonymous</p>
                  <p className="text-gray-400">Find local support groups</p>
                  <a
                    href="https://www.gamblersanonymous.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-beef-red hover:underline inline-flex items-center mt-2"
                  >
                    Find a Meeting <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </div>

                <div className="bg-beef-dark p-4 rounded-lg">
                  <p className="text-white font-semibold">SAMHSA National Helpline</p>
                  <p className="text-gray-400">Hotline: 1-800-662-4357</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Substance abuse and mental health services
                  </p>
                </div>
              </div>
            </div>

            {/* International Resources */}
            <div>
              <h3 className="text-xl font-bold text-beef-red mb-3">International</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-beef-dark p-4 rounded-lg">
                  <p className="text-white font-semibold">UK</p>
                  <p className="text-gray-400">0808 8020 133</p>
                  <a
                    href="https://www.begambleaware.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-beef-red hover:underline text-sm"
                  >
                    BeGambleAware.org
                  </a>
                </div>

                <div className="bg-beef-dark p-4 rounded-lg">
                  <p className="text-white font-semibold">Canada</p>
                  <p className="text-gray-400">1-866-531-2600</p>
                  <a
                    href="https://www.problemgambling.ca"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-beef-red hover:underline text-sm"
                  >
                    ProblemGambling.ca
                  </a>
                </div>

                <div className="bg-beef-dark p-4 rounded-lg">
                  <p className="text-white font-semibold">Australia</p>
                  <p className="text-gray-400">1800 858 858</p>
                  <a
                    href="https://www.gamblinghelponline.org.au"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-beef-red hover:underline text-sm"
                  >
                    GamblingHelpOnline.org.au
                  </a>
                </div>

                <div className="bg-beef-dark p-4 rounded-lg">
                  <p className="text-white font-semibold">Ireland</p>
                  <p className="text-gray-400">089 241 5401</p>
                  <a
                    href="https://www.problemgambling.ie"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-beef-red hover:underline text-sm"
                  >
                    ProblemGambling.ie
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Self-Help Tips */}
        <div className="bg-beef-gray rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            <Shield className="inline w-6 h-6 mr-2 text-green-500" />
            Tips for Responsible Gaming
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-green-500 font-bold mb-3">DO:</h3>
              <ul className="space-y-2">
                {[
                  'Set a budget before you start',
                  'Treat gambling as entertainment, not income',
                  'Take regular breaks',
                  'Only gamble when in a good state of mind',
                  'Understand the odds and mechanics',
                  'Seek help if concerned',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-gray-300">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-red-500 font-bold mb-3">DON'T:</h3>
              <ul className="space-y-2">
                {[
                  'Chase losses',
                  'Gamble with money you can\'t afford to lose',
                  'Borrow money to gamble',
                  'Gamble when under the influence',
                  'Use gambling to solve financial problems',
                  'Let gambling interfere with responsibilities',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-red-500">✗</span>
                    <span className="text-gray-300">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Self-Exclusion */}
        <div className="bg-beef-gray rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Self-Exclusion</h2>
          <p className="text-gray-300 mb-4">
            If you need to take a break from Beef, you can self-exclude for:
          </p>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-beef-dark p-4 rounded-lg text-center">
              <p className="text-white font-bold text-lg">24 Hours</p>
              <p className="text-gray-400 text-sm">Cooling-off period</p>
            </div>
            <div className="bg-beef-dark p-4 rounded-lg text-center">
              <p className="text-white font-bold text-lg">30 Days</p>
              <p className="text-gray-400 text-sm">Short-term break</p>
            </div>
            <div className="bg-beef-dark p-4 rounded-lg text-center">
              <p className="text-white font-bold text-lg">Permanent</p>
              <p className="text-gray-400 text-sm">Close account</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            To self-exclude, contact: <span className="text-beef-red">support@beefplatform.com</span>
          </p>
        </div>

        {/* Age Restriction */}
        <div className="bg-yellow-900 bg-opacity-30 border-2 border-yellow-600 rounded-lg p-6">
          <h2 className="text-yellow-500 font-bold text-xl mb-2">Age Restriction</h2>
          <p className="text-yellow-200">
            You must be 18 years or older to place bets or wagers on Beef. We verify age before
            allowing gambling activities. If you suspect underage gambling, please report it to{' '}
            <span className="font-semibold">abuse@beefplatform.com</span>
          </p>
        </div>

        {/* Back Button */}
        <div className="text-center mt-12">
          <a
            href="/"
            className="inline-block bg-beef-red text-white px-8 py-3 rounded-lg hover:bg-red-700 transition"
          >
            Return to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResponsibleGaming;
