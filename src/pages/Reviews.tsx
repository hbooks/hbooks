import { useEffect, useState } from 'react';
import { Star, Send, X, User } from 'lucide-react';
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
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false });
    if (data) setReviews(data);
  };

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
    setShowForm(false);
  };

  return (
    <main className="min-h-screen bg-secondary text-secondary-foreground py-16 px-4 relative">
      {/* Background image overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 z-0"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format)' }}
      />
      <div className="relative z-10 container mx-auto max-w-4xl">
        <h1 className="font-display text-4xl md:text-5xl text-center mb-12">Reader Reviews</h1>

        {/* Approved Reviews */}
        <section className="mb-16">
          <h2 className="font-display text-2xl mb-8 text-center">What Readers Are Saying</h2>
          {reviews.length === 0 ? (
            <p className="text-center text-muted-foreground">No reviews yet. Be the first!</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {reviews.map(r => (
                <div key={r.id} className="bg-card p-6 rounded-lg shadow-md border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                      <User size={14} className="text-accent" />
                    </div>
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

        {/* Button to open form */}
        <div className="text-center">
          <Button
            variant="hero"
            size="lg"
            onClick={() => setShowForm(true)}
            className="px-10 py-6 text-lg"
          >
            <Send size={20} className="mr-2" />
            Write a Review
          </Button>
        </div>

        {/* Modal Form */}
        {showForm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          >
            <div
              className="bg-card max-w-md w-full rounded-2xl shadow-2xl border border-accent/20 p-8 relative animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-accent transition-colors"
              >
                <X size={20} />
              </button>

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
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </Button>
                {success && (
                  <p className="text-center text-sm text-accent font-medium">
                    Thank you! Your review has been submitted for approval.
                  </p>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Reviews;
  );
};

export default Reviews;
