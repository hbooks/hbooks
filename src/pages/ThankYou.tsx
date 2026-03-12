import { useState } from 'react';
import { Heart, CheckCircle, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const ThankYou = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [alreadyVerified, setAlreadyVerified] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAlreadyVerified(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        'https://xwomtgvefbshvzgddnig.supabase.co/functions/v1/verify-email',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      if (data.alreadyVerified) {
        setAlreadyVerified(true);
      }
      setIsVerified(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-200">
          {!isVerified ? (
            <>
              {/* Icon */}
              <div className="w-32 h-32 bg-amber-600 rounded-full mx-auto mb-8 flex items-center justify-center shadow-lg">
                <Heart size={64} className="text-white" />
              </div>

              {/* Main Heading */}
              <h1 className="font-display text-5xl md:text-7xl text-gray-900 mb-4">
                Thank You!
              </h1>

              <p className="text-2xl md:text-3xl text-gray-600 mb-8">
                Almost there…
              </p>

              <p className="text-lg text-gray-600 mb-6 max-w-lg mx-auto">
                Please enter your email again to verify and receive your exclusive content.
              </p>

              {/* Verification Form */}
              <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full px-5 py-4 rounded-xl bg-white border-2 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200 transition-all shadow-sm"
                  disabled={isSubmitting}
                  required
                />
                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Verifying…' : 'Verify Email'}
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <>
              <div className="w-32 h-32 bg-green-600 rounded-full mx-auto mb-8 flex items-center justify-center shadow-lg">
                {alreadyVerified ? (
                  <Info size={64} className="text-white" />
                ) : (
                  <CheckCircle size={64} className="text-white" />
                )}
              </div>
              <h1 className="font-display text-5xl md:text-7xl text-green-700 mb-4">
                {alreadyVerified ? 'Already Verified' : 'Verified!'}
              </h1>
              <p className="text-2xl md:text-3xl text-gray-600 mb-6">
                {alreadyVerified
                  ? 'Your email was already in our system.'
                  : 'Your email has been confirmed.'}
              </p>
              <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
                {alreadyVerified
                  ? 'You will continue to receive exclusive content as usual.'
                  : 'A confirmation email is on its way. Your exclusive scenes will arrive shortly.'}
              </p>
              <Link
                to="/"
                className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-bold text-xl px-12 py-5 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Visit Main Website
              </Link>
            </>
          )}

          {/* Footer */}
          <p className="text-sm text-gray-500 mt-12">
            © 2026 H00man Publishers — Where every story finds its home.
          </p>
        </div>
      </div>
    </main>
  );
};

export default ThankYou;
