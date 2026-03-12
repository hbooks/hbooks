import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const ThankYou = () => {
  return (
    <main className="min-h-screen bg-secondary text-secondary-foreground flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Main Card */}
        <div className="bg-card rounded-2xl shadow-2xl p-8 md:p-12 border border-accent/20">
          
          {/* Large Icon */}
          <div className="w-32 h-32 bg-accent rounded-full mx-auto mb-8 flex items-center justify-center shadow-lg shadow-accent/30">
            <Heart size={64} className="text-black" />
          </div>

          {/* Main Thank You Message - BIG AND BOLD */}
          <h1 className="font-display text-5xl md:text-7xl text-cream gold-glow mb-4">
            Thank You!
          </h1>
          
          <p className="text-2xl md:text-3xl text-muted-foreground mb-8">
            You're successfully subscribed.
          </p>

          {/* Simple Supportive Message */}
          <p className="text-lg text-muted-foreground mb-12 max-w-lg mx-auto">
            Check your inbox to confirm your email. Then get ready for exclusive content which you signed up for straight from the Inner Circle.
          </p>

          {/* Big Clear Button */}
          <Link
            to="/"
            className="inline-block bg-accent hover:bg-accent/90 text-black font-bold text-xl px-12 py-5 rounded-xl transition-all duration-300 shadow-lg shadow-accent/30 hover:shadow-xl transform hover:-translate-y-1"
          >
            Visit Main Website
          </Link>

          {/* Simple Footer Note */}
          <p className="text-sm text-muted-foreground mt-12">
            © 2026 H00man Publishers — Where every story finds its home.
          </p>
        </div>
      </div>
    </main>
  );
};

export default ThankYou;
