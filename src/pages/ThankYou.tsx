import { useState } from 'react';
import { Heart, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ThankYou = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic client-side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        'https://xwomtgvefbshvzgddnig.functions.supabase.co/verify-email',
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

      // Success – show checkmark
      setIsVerified(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-secondary text-secondary-foreground flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-card rounded-2xl shadow-2xl p-8 md:p-12 border border-accent/20">
          {!isVerified ? (
            <>
              {/* Large Icon */}
              <div className="w-32 h-32 bg-accent rounded-full mx-auto mb-8 flex items-center justify-center shadow-lg shadow-accent/30">
                <Heart size={64} className="text-black" />
              </div>

              <h1 className="font-display text-5xl md:text-7xl text-cream gold-glow mb-4">
                Thank You!
              </h1>

              <p className="text-2xl md:text-3xl text-muted-foreground mb-8">
                Almost there…
              </p>

              <p className="text-lg text-muted-foreground mb-6 max-w-lg mx-auto">
                Please enter your email again to verify and receive your exclusive content.
              </p>

              {/* Verification Form */}
              <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full px-5 py-4 rounded-xl bg-secondary border border-accent/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  disabled={isSubmitting}
                  required
                />
                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-accent hover:bg-accent/90 text-black font-bold text-lg px-8 py-4 rounded-xl transition-all duration-300 shadow-lg shadow-accent/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Verifying…' : 'Verify Email'}
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <>
              <div className="w-32 h-32 bg-green-500 rounded-full mx-auto mb-8 flex items-center justify-center shadow-lg shadow-green-500/30">
                <CheckCircle size={64} className="text-black" />
              </div>
              <h1 className="font-display text-5xl md:text-7xl text-cream gold-glow mb-4">
                Verified!
              </h1>
              <p className="text-2xl md:text-3xl text-muted-foreground mb-6">
                Your email has been confirmed.
              </p>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
                A confirmation email is on its way. Your exclusive scenes will arrive shortly.
              </p>
              <Link
                to="/"
                className="inline-block bg-accent hover:bg-accent/90 text-black font-bold text-xl px-12 py-5 rounded-xl transition-all duration-300 shadow-lg shadow-accent/30 hover:shadow-xl transform hover:-translate-y-1"
              >
                Visit Main Website
              </Link>
            </>
          )}

          {/* Footer Note (always shown) */}
          <p className="text-sm text-muted-foreground mt-12">
            © 2026 H00man Publishers — Where every story finds its home.
          </p>
        </div>
      </div>
    </main>
  );
};

export default ThankYou;
