import { useEffect, useState } from 'react';
import { Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import bookCover from '@/assets/gilded-cage-cover.png';

// Extend Window to include ml
declare global {
  interface Window {
    ml?: any;
  }
}

const Books = () => {
  const [praise, setPraise] = useState<{ reviewer_name: string; review_text: string; rating: number } | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  useEffect(() => {
    supabase
      .from('reviews')
      .select('reviewer_name, review_text, rating')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setPraise(data);
      });
  }, []);

  const handleBuyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowBuyModal(true);
  };

  const handleSignupClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Open MailerLite popup directly
    if (window.ml) {
      window.ml('show', 'BPQnm2', true);
    } else {
      // Fallback if MailerLite not loaded
      window.open('https://preview.mailerlite.io/forms/2154875/180842715123025820/share', '_blank');
    }
    // Optionally show a modal with instructions instead of opening directly
    // setShowSignupModal(true);
  };

  const handleContinueToStore = () => {
    window.open('https://books2read.com/u/mgQwZK', '_blank', 'noopener,noreferrer');
    setShowBuyModal(false);
  };

  return (
    <main className="min-h-screen bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start max-w-5xl mx-auto">
          {/* Book Cover */}
          <div className="flex-shrink-0 animate-fade-in-up">
            <img
              src={bookCover}
              alt="The Gilded Cage"
              className="w-72 md:w-80 lg:w-96 rounded-lg shadow-2xl"
            />
          </div>

          {/* Book Details */}
          <div className="flex-1 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h1 className="font-display text-4xl md:text-5xl mb-2 text-cream gold-glow">The Gilded Cage</h1>
            <p className="text-accent italic text-lg mb-6">Lovely Strangers, Book 1</p>

            <div className="bg-card text-card-foreground p-8 rounded-lg shadow-md mb-8">
              <p className="drop-cap leading-relaxed text-lg">
                Remy Sot has spent four years at university chasing two dreams: making his parents proud, and winning the girl he loves. But when graduation brings rejection instead of romance, he's forced to confront a lifetime of emotional miscalculation—and the loneliness he's carried since childhood.
              </p>
              <p className="leading-relaxed mt-4">
                Set against the simmering tension between two rival counties, this is a story about friendship, betrayal, and the strangers we become to the ones who raised us.
              </p>
            </div>

            {/* Button Group: Buy + Newsletter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="hero"
                size="lg"
                onClick={handleBuyClick}
                className="text-lg px-10 py-6 flex-1 cursor-pointer"
              >
                Buy from your favourite store
              </Button>

              <Button
                variant="hero"
                size="lg"
                onClick={handleSignupClick}
                className="text-lg px-10 py-6 flex-1 bg-accent text-accent-foreground hover:bg-accent/90 border-0 font-bold shadow-lg cursor-pointer"
              >
                Sign up for exclusive scenes
              </Button>
            </div>

            {/* Praise Section */}
            {praise && (
              <div className="mt-10 border-t border-accent/30 pt-8">
                <h3 className="font-display text-xl text-accent mb-4">Praise for the Book</h3>
                <blockquote className="italic text-cream opacity-80 leading-relaxed">
                  "{praise.review_text}"
                </blockquote>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-sm text-cream opacity-60">— {praise.reviewer_name}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} className={i < praise.rating ? 'star-filled fill-current' : 'star-empty'} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for Buy Button */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card max-w-md w-full rounded-2xl shadow-2xl border border-accent/20 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display text-2xl text-accent">Leaving Our Site</h3>
                <button
                  onClick={() => setShowBuyModal(false)}
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <p className="text-muted-foreground mb-6">
                You're about to visit Books2Read, our trusted retailer partner. They offer multiple store options (Amazon, Kobo, Apple Books, etc.). Would you like to continue?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <Button
                  variant="hero"
                  onClick={() => setShowBuyModal(false)}
                  className="border-border hover:bg-accent/10"
                >
                  Stay Here
                </Button>
                <Button
                  onClick={handleContinueToStore}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  Continue to Store
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Books;
