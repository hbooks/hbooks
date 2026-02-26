import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, Save, BookOpen, Newspaper, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'PRandRAPHAEL22';

type Tab = 'books' | 'news' | 'upcoming';

interface BookRow {
  id?: number;
  title: string;
  cover_image: string;
  description: string;
  ubl_link: string;
  series: string;
  published: boolean;
}

interface NewsRow {
  id?: number;
  title: string;
  content: string;
  date: string;
  published: boolean;
}

interface UpcomingRow {
  id?: number;
  title: string;
  cover_image: string;
  description: string;
  estimated_date: string;
  published: boolean;
}

const emptyBook: BookRow = { title: '', cover_image: '', description: '', ubl_link: '', series: '', published: true };
const emptyNews: NewsRow = { title: '', content: '', date: new Date().toISOString().slice(0, 16), published: true };
const emptyUpcoming: UpcomingRow = { title: '', cover_image: '', description: '', estimated_date: '', published: true };

const AdminPortal = ({ isOpen, onClose }: AdminPortalProps) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('books');

  const [books, setBooks] = useState<BookRow[]>([]);
  const [news, setNews] = useState<NewsRow[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingRow[]>([]);

  const [editBook, setEditBook] = useState<BookRow>(emptyBook);
  const [editNews, setEditNews] = useState<NewsRow>(emptyNews);
  const [editUpcoming, setEditUpcoming] = useState<UpcomingRow>(emptyUpcoming);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (authenticated) {
      fetchAll();
    }
  }, [authenticated]);

  const fetchAll = async () => {
    const [b, n, u] = await Promise.all([
      supabase.from('books').select('*').order('created_at', { ascending: false }),
      supabase.from('news_posts').select('*').order('date', { ascending: false }),
      supabase.from('upcoming_books').select('*').order('created_at', { ascending: false }),
    ]);
    if (b.data) setBooks(b.data);
    if (n.data) setNews(n.data);
    if (u.data) setUpcoming(u.data);
  };

  const handleLogin = () => {
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      setAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials');
    }
  };

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  // BOOKS CRUD
  const saveBook = async () => {
    if (!editBook.title) return;
    if (editingId) {
      await supabase.from('books').update(editBook).eq('id', editingId);
      flash('Book updated');
    } else {
      await supabase.from('books').insert(editBook);
      flash('Book published');
    }
    setEditBook(emptyBook);
    setEditingId(null);
    fetchAll();
  };

  const deleteBook = async (id: number) => {
    await supabase.from('books').delete().eq('id', id);
    flash('Book deleted');
    fetchAll();
  };

  // NEWS CRUD
  const saveNews = async () => {
    if (!editNews.title) return;
    if (editingId) {
      await supabase.from('news_posts').update(editNews).eq('id', editingId);
      flash('News updated');
    } else {
      await supabase.from('news_posts').insert(editNews);
      flash('News published');
    }
    setEditNews(emptyNews);
    setEditingId(null);
    fetchAll();
  };

  const deleteNews = async (id: number) => {
    await supabase.from('news_posts').delete().eq('id', id);
    flash('News deleted');
    fetchAll();
  };

  // UPCOMING CRUD
  const saveUpcoming = async () => {
    if (!editUpcoming.title) return;
    if (editingId) {
      await supabase.from('upcoming_books').update(editUpcoming).eq('id', editingId);
      flash('Updated');
    } else {
      await supabase.from('upcoming_books').insert(editUpcoming);
      flash('Added to library');
    }
    setEditUpcoming(emptyUpcoming);
    setEditingId(null);
    fetchAll();
  };

  const deleteUpcoming = async (id: number) => {
    await supabase.from('upcoming_books').delete().eq('id', id);
    flash('Deleted');
    fetchAll();
  };

  if (!isOpen) return null;

  const inputClass = "w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent";
  const tabClass = (t: Tab) =>
    `flex items-center gap-2 px-4 py-2 rounded-t text-sm font-semibold transition-colors ${
      activeTab === t ? 'bg-card text-foreground' : 'bg-secondary text-secondary-foreground hover:text-accent'
    }`;

  return (
    <div className="fixed inset-0 z-[100] bg-charcoal/95 flex items-center justify-center p-4 overflow-auto">
      <div className="bg-card rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto relative">
        <button onClick={() => { onClose(); setAuthenticated(false); setUsername(''); setPassword(''); }} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X size={24} />
        </button>

        {!authenticated ? (
          <div className="p-8 max-w-sm mx-auto">
            <h2 className="font-display text-2xl text-center mb-6">Admin Portal</h2>
            <div className="space-y-3">
              <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className={inputClass} />
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass}
                onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              <Button variant="hero" className="w-full" onClick={handleLogin}>Login</Button>
              {loginError && <p className="text-destructive text-sm text-center">{loginError}</p>}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <h2 className="font-display text-2xl mb-4">Admin Dashboard</h2>
            {msg && <div className="bg-accent text-accent-foreground text-sm px-4 py-2 rounded mb-4 text-center font-medium">{msg}</div>}

            {/* Tabs */}
            <div className="flex gap-1 mb-4">
              <button className={tabClass('books')} onClick={() => { setActiveTab('books'); setEditingId(null); }}>
                <BookOpen size={16} /> My Books
              </button>
              <button className={tabClass('news')} onClick={() => { setActiveTab('news'); setEditingId(null); }}>
                <Newspaper size={16} /> Update
              </button>
              <button className={tabClass('upcoming')} onClick={() => { setActiveTab('upcoming'); setEditingId(null); }}>
                <Clock size={16} /> List Update
              </button>
            </div>

            {/* BOOKS TAB */}
            {activeTab === 'books' && (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className={inputClass} placeholder="Title" value={editBook.title} onChange={e => setEditBook({ ...editBook, title: e.target.value })} />
                  <input className={inputClass} placeholder="Series" value={editBook.series} onChange={e => setEditBook({ ...editBook, series: e.target.value })} />
                  <input className={inputClass} placeholder="Cover Image URL" value={editBook.cover_image} onChange={e => setEditBook({ ...editBook, cover_image: e.target.value })} />
                  <input className={inputClass} placeholder="UBL Link" value={editBook.ubl_link} onChange={e => setEditBook({ ...editBook, ubl_link: e.target.value })} />
                </div>
                <textarea className={inputClass + ' resize-none'} rows={3} placeholder="Description" value={editBook.description} onChange={e => setEditBook({ ...editBook, description: e.target.value })} />
                <Button variant="hero" size="sm" onClick={saveBook}>
                  {editingId ? <><Save size={14} /> Update Book</> : <><Plus size={14} /> Publish New Book</>}
                </Button>

                <div className="space-y-2 mt-4">
                  {books.map(b => (
                    <div key={b.id} className="flex items-center justify-between bg-muted p-3 rounded text-sm">
                      <span className="font-medium">{b.title}</span>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditBook(b); setEditingId(b.id!); }} className="text-accent hover:text-foreground"><Edit2 size={14} /></button>
                        <button onClick={() => deleteBook(b.id!)} className="text-destructive hover:text-foreground"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NEWS TAB */}
            {activeTab === 'news' && (
              <div className="space-y-4">
                <input className={inputClass} placeholder="Title" value={editNews.title} onChange={e => setEditNews({ ...editNews, title: e.target.value })} />
                <textarea className={inputClass + ' resize-none'} rows={4} placeholder="Content" value={editNews.content} onChange={e => setEditNews({ ...editNews, content: e.target.value })} />
                <Button variant="hero" size="sm" onClick={saveNews}>
                  {editingId ? <><Save size={14} /> Update News</> : <><Plus size={14} /> Publish News</>}
                </Button>

                <div className="space-y-2 mt-4">
                  {news.map(n => (
                    <div key={n.id} className="flex items-center justify-between bg-muted p-3 rounded text-sm">
                      <span className="font-medium">{n.title}</span>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditNews(n); setEditingId(n.id!); }} className="text-accent hover:text-foreground"><Edit2 size={14} /></button>
                        <button onClick={() => deleteNews(n.id!)} className="text-destructive hover:text-foreground"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* UPCOMING TAB */}
            {activeTab === 'upcoming' && (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className={inputClass} placeholder="Title" value={editUpcoming.title} onChange={e => setEditUpcoming({ ...editUpcoming, title: e.target.value })} />
                  <input className={inputClass} placeholder="Estimated Date" value={editUpcoming.estimated_date} onChange={e => setEditUpcoming({ ...editUpcoming, estimated_date: e.target.value })} />
                  <input className={inputClass} placeholder="Cover Image URL" value={editUpcoming.cover_image} onChange={e => setEditUpcoming({ ...editUpcoming, cover_image: e.target.value })} />
                </div>
                <textarea className={inputClass + ' resize-none'} rows={3} placeholder="Description" value={editUpcoming.description} onChange={e => setEditUpcoming({ ...editUpcoming, description: e.target.value })} />
                <Button variant="hero" size="sm" onClick={saveUpcoming}>
                  {editingId ? <><Save size={14} /> Update</> : <><Plus size={14} /> Add to Library</>}
                </Button>

                <div className="space-y-2 mt-4">
                  {upcoming.map(u => (
                    <div key={u.id} className="flex items-center justify-between bg-muted p-3 rounded text-sm">
                      <span className="font-medium">{u.title}</span>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditUpcoming(u); setEditingId(u.id!); }} className="text-accent hover:text-foreground"><Edit2 size={14} /></button>
                        <button onClick={() => deleteUpcoming(u.id!)} className="text-destructive hover:text-foreground"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPortal;
