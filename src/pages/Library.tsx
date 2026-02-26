import { useEffect, useState } from 'react';
import { User, BookOpen, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import gildedCageCover from '@/assets/gilded-cage-cover.png';
import trappedCover from '@/assets/trapped-cover.png';

interface Book {
  id: number;
  title: string;
  cover_image: string;
  description: string;
  ubl_link?: string;
  series?: string;
}

interface UpcomingBook {
  id: number;
  title: string;
  cover_image: string;
  description: string;
  estimated_date: string;
}

const fallbackBooks: Book[] = [
  {
    id: 1,
    title: 'The Gilded Cage',
    cover_image: gildedCageCover,
    description: 'Remy Sot has spent four years at university chasing two dreams: making his parents proud, and winning the girl he loves. But when graduation brings rejection instead of romance, he\'s forced to confront a lifetime of emotional miscalculation.',
    ubl_link: 'https://books2read.com/u/mgQwZK',
    series: 'Lovely Strangers, Book 1',
  },
];

const fallbackUpcoming: UpcomingBook[] = [
  {
    id: 1,
    title: 'Lovely Strangers, Volume 2',
    cover_image: gildedCageCover,
    description: 'The story continues. Deeper connections, darker secrets, and the consequences of choices made in the heat of youth. Volume 2 picks up where The Gilded Cage left off.',
    estimated_date: '2–4 weeks',
  },
  {
    id: 2,
    title: 'TRAPPED (Working Title)',
    cover_image: trappedCover,
    description: 'Something new is taking shape. Darker? Maybe. More intense? Definitely. The bones are there, and the excitement about where this one is headed is undeniable.',
    estimated_date: 'Sketching Ideas',
  },
];

const Library = () => {
  const [books, setBooks] = useState<Book[]>(fallbackBooks);
  const [upcoming, setUpcoming] = useState<UpcomingBook[]>(fallbackUpcoming);

  useEffect(() => {
    supabase
      .from('books')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) setBooks(data);
      });

    supabase
      .from('upcoming_books')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) setUpcoming(data);
      });
  }, []);

  const getCoverSrc = (img: string) => {
    if (img.startsWith('http') || img.startsWith('/') || img.startsWith('data:')) return img;
    return img;
  };

  return (
    <main className="min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
            <User size={36} className="text-accent" />
          </div>
          <p className="text-muted-foreground italic">By Raphael M. Mwaura</p>
          <h1 className="font-display text-4xl md:text-5xl mt-2">Published & Forthcoming</h1>
        </div>

        {/* Published Books */}
        <section className="mb-20">
          <h2 className="font-display text-3xl mb-8 flex items-center gap-3">
            <BookOpen size={28} className="text-accent" /> Published Books
          </h2>
          <div className="space-y-8">
            {books.map(book => (
              <div key={book.id} className="flex flex-col sm:flex-row gap-8 bg-card p-6 rounded-lg shadow-md border border-border">
                <img
                  src={getCoverSrc(book.cover_image)}
                  alt={book.title}
                  className="w-40 h-auto rounded-md shadow-lg flex-shrink-0 mx-auto sm:mx-0"
                />
                <div className="flex-1">
                  <h3 className="font-display text-2xl mb-1">{book.title}</h3>
                  {book.series && <p className="text-accent italic text-sm mb-3">{book.series}</p>}
                  <p className="leading-relaxed text-foreground opacity-80 mb-4">{book.description}</p>
                  {book.ubl_link && (
                    <Button variant="hero" size="sm" asChild>
                      <a href={book.ubl_link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink size={14} /> Get the Book
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Books */}
        <section className="mb-16">
          <h2 className="font-display text-3xl mb-8 flex items-center gap-3">
            <Clock size={28} className="text-accent" /> Upcoming
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            {upcoming.map(book => (
              <div key={book.id} className="bg-secondary text-secondary-foreground p-6 rounded-lg shadow-md">
                <img
                  src={getCoverSrc(book.cover_image)}
                  alt={book.title}
                  className="w-full h-64 object-cover rounded-md mb-4"
                />
                <h3 className="font-display text-xl text-cream mb-1">{book.title}</h3>
                <span className="inline-block bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full mb-3">
                  {book.estimated_date}
                </span>
                <p className="text-cream opacity-80 text-sm leading-relaxed">{book.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Discord CTA */}
        <div className="text-center bg-card p-8 rounded-lg shadow-md border border-border">
          <h3 className="font-display text-2xl mb-3">Want Early Leaks?</h3>
          <p className="text-muted-foreground mb-4">
            Join the Discord for exclusive sneak peeks, concept art, and behind-the-scenes notes.
          </p>
          <Button variant="hero" asChild>
            <a href="https://discord.gg/zbaugS2B2" target="_blank" rel="noopener noreferrer">
              Join Discord
            </a>
          </Button>
        </div>
      </div>
    </main>
  );
};

export default Library;
