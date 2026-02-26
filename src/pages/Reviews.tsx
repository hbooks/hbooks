import { useEffect, useState } from 'react';
import { Star, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

interface Review {
  id: number;
  reviewer_name: string;
  rating: number;
  review_text: string;
  created_at: string;
}

const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    supabase
      .from('reviews')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setReviews(data);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    await supabase.from('reviews').insert({
      reviewer_name: name.trim() || 'Fan',
      rating,
      review_text: text.trim(),
      approved: false,
    });
    setSubmitting(false);
    setSuccess(true);
    setName('');
    setRating(5);
    setText('');
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <main className="min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="font-display text-4xl md:text-5xl text-center mb-12">Reader Reviews</h1>

        {/* Submit Form */}
        <section className="bg-card p-8 rounded-lg shadow-md border border-border mb-12 max-w-xl mx-auto">
          <h2 className="font-display text-2xl mb-6 text-center">Leave a Review</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Your Name (optional)</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={100}
                placeholder="Fan"
                className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className="p-1"
                  >
                    <Star
                      size={24}
                      className={s <= rating ? 'star-filled fill-current' : 'star-empty'}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Your Review</label>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                required
                maxLength={1000}
                rows={4}
                className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              />
            </div>
            <Button type="submit" disabled={submitting} variant="hero" className="w-full">
              <Send size={16} /> {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
            {success && (
              <p className="text-center text-sm text-accent font-medium">
                Thank you! Your review has been submitted for approval.
              </p>
            )}
          </form>
        </section>

        {/* Approved Reviews */}
        <section>
          <h2 className="font-display text-2xl mb-8 text-center">What Readers Are Saying</h2>
          {reviews.length === 0 ? (
            <p className="text-center text-muted-foreground">No reviews yet. Be the first!</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {reviews.map(r => (
                <div key={r.id} className="bg-card p-6 rounded-lg shadow-md border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-semibold">{r.reviewer_name}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={14} className={i < r.rating ? 'star-filled fill-current' : 'star-empty'} />
                      ))}
                    </div>
                  </div>
                  <p className="text-foreground opacity-80 leading-relaxed">{r.review_text}</p>
                  <p className="text-muted-foreground text-xs mt-3">
                    {new Date(r.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Reviews;
