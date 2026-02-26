import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import bookCover from '@/assets/gilded-cage-cover.png';

const Books = () => {
  const [praise, setPraise] = useState<{ reviewer_name: string; review_text: string; rating: number } | null>(null);

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

            <Button variant="hero" size="lg" asChild className="text-lg px-10 py-6">
              <a href="https://books2read.com/u/mgQwZK" target="_blank" rel="noopener noreferrer">
                Buy from your favourite store
              </a>
            </Button>

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
    </main>
  );
};

export default Books;
