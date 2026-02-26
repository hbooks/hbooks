import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import bookCover from '@/assets/gilded-cage-cover.png';

interface NewsPost {
  title: string;
  date: string;
  content: string;
}

const fallbackNews: NewsPost = {
  title: 'Join Our New Discord Community!',
  date: '2026-02-26',
  content: 'We have just launched our brand-new Discord server! Come hang out, chat about books, and get early updates on upcoming releases. This is where you\'ll find exclusive sneak peeks, behind-the-scenes notes, and direct conversations with the author.',
};

const Particles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 25 }).map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full bg-accent opacity-20"
        style={{
          width: `${2 + Math.random() * 4}px`,
          height: `${2 + Math.random() * 4}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `float ${4 + Math.random() * 6}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 3}s`,
        }}
      />
    ))}
  </div>
);

const Index = () => {
  const [latestNews, setLatestNews] = useState<NewsPost>(fallbackNews);

  useEffect(() => {
    supabase
      .from('news_posts')
      .select('title, date, content')
      .eq('published', true)
      .order('date', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setLatestNews(data);
      });
  }, []);

  return (
    <>
      <section className="hero-gradient min-h-[85vh] flex items-center justify-center px-4">
        <Particles />
        <div className="container mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="flex-1 text-center md:text-left animate-fade-in-up">
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold mb-4 text-cream gold-glow">
              The Gilded Cage
            </h1>
            <p className="text-xl italic text-accent mb-2">Lovely Strangers, Book 1</p>
            <p className="text-lg mb-8 text-cream opacity-80">Romance with a twist of mystery.</p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Button variant="hero" size="lg" asChild>
                <Link to="/books">Learn More</Link>
              </Button>
              <Button variant="heroOutline" size="lg" asChild>
                <a href="https://books2read.com/u/mgQwZK" target="_blank" rel="noopener noreferrer">
                  Buy the Book
                </a>
              </Button>
            </div>
          </div>
          <div className="flex-shrink-0 animate-float">
            <img
              src={bookCover}
              alt="The Gilded Cage - Book Cover"
              className="w-56 sm:w-64 md:w-80 rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl mb-8">Latest from the Desk</h2>
          <div className="max-w-2xl mx-auto bg-card p-8 rounded-lg shadow-md border border-border">
            <h3 className="font-display text-xl mb-2">{latestNews.title}</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {new Date(latestNews.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-foreground opacity-80 leading-relaxed">
              {latestNews.content.substring(0, 200)}...
            </p>
          </div>
          <Link
            to="/news"
            className="inline-block mt-6 text-accent hover:text-primary transition-colors font-semibold"
          >
            All news →
          </Link>
        </div>
      </section>
    </>
  );
};

export default Index;
