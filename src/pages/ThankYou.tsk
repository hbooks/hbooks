import { Heart, Mail, Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const ThankYou = () => {
  return (
    <main className="min-h-screen bg-secondary text-secondary-foreground flex items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full">
        {/* Main Content Card */}
        <div className="bg-card rounded-2xl shadow-2xl overflow-hidden border border-accent/10">
          
          {/* Header Accent Bar */}
          <div className="h-2 bg-gradient-to-r from-accent to-accent/40"></div>
          
          <div className="p-8 md:p-12 text-center space-y-8">
            
            {/* Animated Icon */}
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 mx-auto flex items-center justify-center animate-pulse-slow">
                <Heart size={56} className="text-accent fill-accent/20" />
              </div>
              <div className="absolute -top-2 -right-2 md:right-24">
                <Sparkles size={24} className="text-accent animate-bounce" />
              </div>
            </div>

            {/* Main Thank You Message */}
            <div className="space-y-3">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-cream gold-glow">
                You're In.
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Welcome to the <span className="text-accent font-semibold">Inner Circle</span>. 
                We're genuinely happy you're here.
              </p>
            </div>

            {/* Email Confirmation Message */}
            <div className="bg-secondary/50 p-6 rounded-xl border border-accent/10">
              <div className="flex items-center justify-center gap-2 text-accent mb-3">
                <Mail size={20} />
                <span className="font-display text-lg">Check Your Inbox</span>
              </div>
              <p className="text-muted-foreground">
                We've sent you a confirmation email. Please click the link inside to verify and confirm your address— 
                it's how we know you're real (and not a very clever robot).
              </p>
            </div>

            {/* What Happens Next Section */}
            <div className="text-left bg-card/50 p-6 rounded-xl border border-accent/5">
              <h2 className="font-display text-xl text-accent mb-4 flex items-center gap-2">
                <Sparkles size={20} />
                Here's What Happens Next
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="bg-accent/10 text-accent rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm">1</span>
                  <span className="text-muted-foreground">
                    <span className="text-cream font-medium">Confirm your email</span> — 
                    It takes 5 seconds and keeps your information secure.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-accent/10 text-accent rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm">2</span>
                  <span className="text-muted-foreground">
                    <span className="text-cream font-medium">Your news, exclusive content and Discount link arrives</span> — 
                    Within minutes, you'll find whatever you signed up for waiting in your inbox.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-accent/10 text-accent rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm">3</span>
                  <span className="text-muted-foreground">
                    <span className="text-cream font-medium">You become family</span> — 
                    Occasional emails. Never spam. Always stories that matter.
                  </span>
                </li>
              </ul>
            </div>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                to="/"
                className="group bg-accent hover:bg-accent/90 text-black font-semibold px-8 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-lg shadow-lg shadow-accent/20"
              >
                Visit Main Website
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/books"
                className="bg-transparent border-2 border-accent/30 hover:border-accent text-cream hover:text-accent px-8 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-lg"
              >
                <BookOpen size={20} />
                Explore The Gilded Cage
              </Link>
            </div>

            {/* Trust Message */}
            <p className="text-xs text-muted-foreground pt-4 border-t border-accent/10">
              Your privacy matters. We'll never share your information. Unsubscribe anytime with one click.
            </p>
          </div>
        </div>

        {/* Decorative Footer */}
        <div className="text-center mt-6 text-xs text-muted-foreground">
          <span>© 2026 H00man Publishers — Where every story finds its home.</span>
        </div>
      </div>
    </main>
  );
};

export default ThankYou;
