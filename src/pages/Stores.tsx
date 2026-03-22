import { useEffect, useState } from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import RedirectModal from '@/components/RedirectModal';

interface Book {
  id: string;
  title: string;
  ubl: string;
}

const Stores = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<{ title: string; url: string } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      const { data, error } = await supabase
        .from('books')
        .select('id, title, ubl')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching books:', error);
      } else {
        setBooks(data || []);
      }
      setLoading(false);
    };
    fetchBooks();
  }, []);

  const handleBuyClick = (book: Book) => {
    setSelectedBook({ title: book.title, url: book.ubl });
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <p className="text-cream">Loading stores...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 py-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-full bg-accent mx-auto mb-6 flex items-center justify-center">
            <BookOpen size={36} className="text-accent-foreground" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-cream mb-4">Get My Published Books</h1>
          <p className="text-muted-foreground text-lg">Find my books on your favourite online stores</p>
        </div>

        <div className="space-y-4">
          {books.map((book) => (
            <div
              key={book.id}
              className="bg-card border border-border rounded-lg p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all hover:shadow-lg"
            >
              <h2 className="font-display text-xl text-yellow-500">{book.title}</h2>
              <Button
                variant="heroOutline"
                onClick={() => handleBuyClick(book)}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <ExternalLink size={16} />
                Get the Book
              </Button>
            </div>
          ))}
          {books.length === 0 && (
            <p className="text-center text-muted-foreground">No books available yet.</p>
          )}
        </div>
      </div>

      <RedirectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        url={selectedBook?.url || ''}
        title={selectedBook?.title || 'the book page'}
      />
    </main>
  );
};

export default Stores;
