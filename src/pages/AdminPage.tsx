import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Session } from '@supabase/supabase-js';
import { format } from 'date-fns';
import {
  LogOut,
  Database,
  Eye,
  EyeOff,
  Save,
  X,
  Trash2,
  Plus,
  Edit2,
  Upload,
  CheckCircle,
  AlertCircle,
  User,
  Clock,
  BookOpen,
  Newspaper,
  Layout,
  FileText,
  RefreshCw,
  Crown,
  Mail,
  Reply,
  List,
  Calendar,
} from 'lucide-react';

type Tab = 'hbdb' | 'content' | 'logs';
type DbSubTab = 'books' | 'news' | 'upcoming' | 'contacts';
type LogsSubTab = 'activity' | 'errors';

interface Book {
  id?: number;
  title: string;
  cover_image: string;
  description: string;
  ubl_link: string;
  published: boolean;
}

interface News {
  id?: number;
  title: string;
  content: string;
  date: string;
  published: boolean;
}

interface Upcoming {
  id?: number;
  title: string;
  cover_image: string;
  description: string;
  estimated_date: string;
 
}

interface Review {
  id?: number;
  reviewer_name: string;
  review_text: string;
  rating: number;
  approved: boolean;
}

interface ContactMessage {
  id?: number;
  name: string;
  email: string;
  message: string;
  replied: boolean;
  created_at: string;
}

interface AdminLog {
  id: number;
  admin_user: string;
  action: string;
  table_name: string;
  record_id: number;
  details: any;
  created_at: string;
}

interface SystemError {
  id: number;
  error_message: string;
  error_stack: string;
  url: string;
  user_agent: string;
  created_at: string;
}

const BUCKET_NAME = 'covers';
const ADMIN_EMAIL = 'admin@hpbooks.uk';

const AdminPage = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | null }>({ message: '', type: null });

  // UI state
  const [activeTab, setActiveTab] = useState<Tab>('hbdb');
  const [dbSubTab, setDbSubTab] = useState<DbSubTab>('books');
  const [logsSubTab, setLogsSubTab] = useState<LogsSubTab>('activity');
  const [showLogsPanel, setShowLogsPanel] = useState(false); // toggle for logs display
  const [currentTime, setCurrentTime] = useState(new Date());

  // Data states
  const [books, setBooks] = useState<Book[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [upcoming, setUpcoming] = useState<Upcoming[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [errors, setErrors] = useState<SystemError[]>([]);

  // Editing states
  const [editBook, setEditBook] = useState<Book>({ title: '', cover_image: '', description: '', ubl_link: '', series: '', published: true });
  const [editNews, setEditNews] = useState<News>({ title: '', content: '', date: new Date().toISOString().slice(0, 16), published: true });
  const [editUpcoming, setEditUpcoming] = useState<Upcoming>({ title: '', cover_image: '', description: '', estimated_date: '', published: true });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (session?.user?.email === ADMIN_EMAIL) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    const [booksRes, newsRes, upcomingRes, reviewsRes, contactsRes, logsRes, errorsRes] = await Promise.all([
      supabase.from('books').select('*').order('created_at', { ascending: false }),
      supabase.from('news_posts').select('*').order('date', { ascending: false }),
      supabase.from('upcoming_books').select('*').order('created_at', { ascending: false }),
      supabase.from('reviews').select('*').order('created_at', { ascending: false }),
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
      supabase.from('admin_logs').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('system_errors').select('*').order('created_at', { ascending: false }).limit(100),
    ]);
    if (booksRes.data) setBooks(booksRes.data);
    if (newsRes.data) setNews(newsRes.data);
    if (upcomingRes.data) setUpcoming(upcomingRes.data);
    if (reviewsRes.data) setReviews(reviewsRes.data);
    if (contactsRes.data) setContacts(contactsRes.data);
    if (logsRes.data) setLogs(logsRes.data);
    if (errorsRes.data) setErrors(errorsRes.data);
  };

  const logAction = async (action: string, table: string, recordId?: number, details?: any) => {
    await supabase.from('admin_logs').insert({
      admin_user: session?.user?.email,
      action,
      table_name: table,
      record_id: recordId,
      details,
    });
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: null }), 4000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoginError(error.message);
      showToast('error', 'Login failed');
    } else {
      showToast('success', 'Welcome back, Admin!');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file) return null;
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;
      const { error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file);
      if (error) throw error;
      return filePath;
    } catch (error: any) {
      showToast('error', 'Upload failed: ' + error.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const getSignedUrl = async (path: string) => {
    const { data } = await supabase.storage.from(BUCKET_NAME).createSignedUrl(path, 60);
    return data?.signedUrl;
  };

  // Books CRUD (remove series if column missing)
  const saveBook = async () => {
    if (!editBook.title) return;
    // Remove series if the column doesn't exist in your DB
    const data = { ...editBook };
    // Optionally delete data.series if column not present
    // delete data.series;
    if (editingId) {
      const { error } = await supabase.from('books').update(data).eq('id', editingId);
      if (error) { showToast('error', 'Update failed: ' + error.message); return; }
      showToast('success', 'Book updated');
      await logAction('UPDATE', 'books', editingId, data);
    } else {
      const { error } = await supabase.from('books').insert(data);
      if (error) { showToast('error', 'Insert failed: ' + error.message); return; }
      showToast('success', 'Book added');
      await logAction('INSERT', 'books', undefined, data);
    }
    setEditBook({ title: '', cover_image: '', description: '', ubl_link: '', series: '', published: true });
    setEditingId(null);
    fetchData();
  };

  const deleteBook = async (id: number) => {
    if (!confirm('Delete this book?')) return;
    await supabase.from('books').delete().eq('id', id);
    showToast('success', 'Book deleted');
    await logAction('DELETE', 'books', id);
    fetchData();
  };

  // News CRUD
  const saveNews = async () => {
    if (!editNews.title) return;
    const data = { ...editNews };
    if (editingId) {
      const { error } = await supabase.from('news_posts').update(data).eq('id', editingId);
      if (error) { showToast('error', 'Update failed: ' + error.message); return; }
      showToast('success', 'News updated');
      await logAction('UPDATE', 'news_posts', editingId, data);
    } else {
      const { error } = await supabase.from('news_posts').insert(data);
      if (error) { showToast('error', 'Insert failed: ' + error.message); return; }
      showToast('success', 'News published');
      await logAction('INSERT', 'news_posts', undefined, data);
    }
    setEditNews({ title: '', content: '', date: new Date().toISOString().slice(0, 16), published: true });
    setEditingId(null);
    fetchData();
  };

  const deleteNews = async (id: number) => {
    if (!confirm('Delete this news?')) return;
    await supabase.from('news_posts').delete().eq('id', id);
    showToast('success', 'News deleted');
    await logAction('DELETE', 'news_posts', id);
    fetchData();
  };

  // Upcoming CRUD (remove published if column missing)
  const saveUpcoming = async () => {
    if (!editUpcoming.title) return;
    const data = { ...editUpcoming };
    // delete data.published if column not present
    if (editingId) {
      const { error } = await supabase.from('upcoming_books').update(data).eq('id', editingId);
      if (error) { showToast('error', 'Update failed: ' + error.message); return; }
      showToast('success', 'Upcoming updated');
      await logAction('UPDATE', 'upcoming_books', editingId, data);
    } else {
      const { error } = await supabase.from('upcoming_books').insert(data);
      if (error) { showToast('error', 'Insert failed: ' + error.message); return; }
      showToast('success', 'Upcoming added');
      await logAction('INSERT', 'upcoming_books', undefined, data);
    }
    setEditUpcoming({ title: '', cover_image: '', description: '', estimated_date: '', published: true });
    setEditingId(null);
    fetchData();
  };

  const deleteUpcoming = async (id: number) => {
    if (!confirm('Delete this upcoming?')) return;
    await supabase.from('upcoming_books').delete().eq('id', id);
    showToast('success', 'Upcoming deleted');
    await logAction('DELETE', 'upcoming_books', id);
    fetchData();
  };

  // Reviews – full management (view/delete any review)
  const deleteReview = async (id: number) => {
    if (!confirm('Delete this review permanently?')) return;
    await supabase.from('reviews').delete().eq('id', id);
    showToast('success', 'Review deleted');
    await logAction('DELETE', 'reviews', id);
    fetchData();
  };

  const approveReview = async (id: number, approve: boolean) => {
    const { error } = await supabase.from('reviews').update({ approved: approve }).eq('id', id);
    if (error) { showToast('error', 'Error updating review'); return; }
    showToast('success', approve ? 'Review approved' : 'Review rejected');
    await logAction(approve ? 'APPROVE' : 'REJECT', 'reviews', id);
    fetchData();
  };

  // Contact messages – toggle replied status
  const toggleReplied = async (id: number, current: boolean) => {
    const { error } = await supabase.from('contact_messages').update({ replied: !current }).eq('id', id);
    if (error) { showToast('error', 'Error updating message status'); return; }
    showToast('success', !current ? 'Marked as replied' : 'Marked as pending');
    await logAction('UPDATE', 'contact_messages', id, { replied: !current });
    fetchData();
  };

  // Image picker component
  const ImagePicker = ({ value, onChange }: { value: string; onChange: (url: string) => void }) => {
    const [preview, setPreview] = useState<string | null>(null);
    useEffect(() => {
      if (value) getSignedUrl(value).then(setPreview);
    }, [value]);
    return (
      <div className="flex gap-2 items-center">
        {preview && <img src={preview} alt="preview" className="h-12 w-auto object-cover rounded shadow" />}
        <label className="cursor-pointer bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
          <Upload size={12} /> Upload
          <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) {
              const path = await uploadImage(file);
              if (path) onChange(path);
            }
          }} />
        </label>
        {uploading && <span className="text-xs text-gray-400">Uploading...</span>}
      </div>
    );
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gold animate-pulse">Loading admin panel...</div>;
  }

  // Not logged in – show login form
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 w-full max-w-md shadow-2xl">
          <div className="flex justify-center mb-6">
            <img src="/assets/favicon/web-app-manifest-192x192.png" alt="Logo" className="w-16 h-16 rounded-full shadow-lg" />
          </div>
          <h2 className="font-display text-3xl text-white text-center mb-8">Admin Access</h2>
          <form onSubmit={handleLogin} className="space-y-5">
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold" />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold" />
            <Button type="submit" variant="hero" className="w-full bg-gold text-black hover:bg-gold/90">Login</Button>
            {loginError && <p className="text-red-400 text-sm text-center">{loginError}</p>}
          </form>
        </div>
      </div>
    );
  }

  // Logged in but not admin email
  if (session.user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl text-center">
          <h2 className="text-2xl font-display text-white mb-4">Access Denied</h2>
          <p className="text-gray-300">You do not have permission to view this page.</p>
          <Button onClick={() => supabase.auth.signOut()} className="mt-6 bg-gold text-black">Logout</Button>
        </div>
      </div>
    );
  }

  // Admin dashboard
  const inputClass = "w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent";
  const tabClass = (tab: Tab) => `flex items-center gap-2 px-4 py-2 rounded-t text-sm font-semibold transition-colors ${activeTab === tab ? 'bg-card text-foreground' : 'bg-secondary text-secondary-foreground hover:text-accent'}`;
  const subTabClass = (tab: string, current: string) => `px-3 py-1 text-sm rounded-full ${current === tab ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent/20'}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-20 shadow-lg">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <img src="/assets/favicon/web-app-manifest-192x192.png" alt="Logo" className="w-10 h-10 rounded-full border-2 border-gold" />
            <div>
              <h1 className="font-display text-xl text-white">Admin Dashboard</h1>
              <p className="text-xs text-gray-400">Welcome, {session.user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-gray-700/50 px-3 py-1 rounded-full text-sm">
              <Clock size={14} className="text-gold" />
              <span className="font-mono">{format(currentTime, 'HH:mm:ss')}</span>
              <Calendar size={14} className="text-gold ml-2" />
              <span>{format(currentTime, 'EEEE')}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowLogsPanel(!showLogsPanel)} className="text-gray-300 hover:text-white">
              <List size={16} className="mr-1" /> {showLogsPanel ? 'Hide Logs' : 'Show Logs'}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-300 hover:text-white">
              <LogOut size={16} className="mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Toast */}
        {toast.type && (
          <div className="fixed bottom-4 right-4 z-50 animate-fade-in-up">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
              {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              {toast.message}
            </div>
          </div>
        )}

        {/* Main Tabs */}
        <div className="flex gap-1 border-b border-border mb-6">
          <button className={tabClass('hbdb')} onClick={() => setActiveTab('hbdb')}><Database size={16} /> HB Database</button>
          <button className={tabClass('content')} onClick={() => setActiveTab('content')}><Layout size={16} /> Content</button>
          <button className={tabClass('logs')} onClick={() => setActiveTab('logs')}><FileText size={16} /> Logs</button>
        </div>

        {/* Logs Panel (toggle) */}
        {showLogsPanel && (
          <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700 backdrop-blur-sm">
            <div className="flex gap-4 mb-3">
              <button className={subTabClass('activity', logsSubTab)} onClick={() => setLogsSubTab('activity')}>Activity Logs</button>
              <button className={subTabClass('errors', logsSubTab)} onClick={() => setLogsSubTab('errors')}>System Errors</button>
            </div>
            {logsSubTab === 'activity' && (
              <div className="overflow-auto max-h-80">
                {logs.length === 0 ? <p className="text-gray-400 text-center py-4">No activity logged yet.</p> : (
                  <table className="w-full text-sm">
                    <thead className="text-left text-gray-400 border-b border-gray-700">
                      <tr><th>Time</th><th>User</th><th>Action</th><th>Table</th><th>Details</th></tr>
                    </thead>
                    <tbody>
                      {logs.map(l => (
                        <tr key={l.id} className="border-b border-gray-700/50">
                          <td className="py-2">{new Date(l.created_at).toLocaleString()}</td>
                          <td>{l.admin_user}</td>
                          <td>{l.action}</td>
                          <td>{l.table_name}</td>
                          <td className="max-w-xs truncate">{JSON.stringify(l.details)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
            {logsSubTab === 'errors' && (
              <div className="overflow-auto max-h-80">
                {errors.length === 0 ? <p className="text-gray-400 text-center py-4">No errors recorded.</p> : (
                  errors.map(e => (
                    <div key={e.id} className="bg-red-900/20 border border-red-500/30 p-3 rounded mb-2 text-sm">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{new Date(e.created_at).toLocaleString()}</span>
                        <span>{e.url}</span>
                      </div>
                      <p className="font-mono text-red-400">{e.error_message}</p>
                      {e.error_stack && <details className="mt-2"><summary className="cursor-pointer">Stack trace</summary><pre className="text-xs text-red-300 overflow-auto max-h-40">{e.error_stack}</pre></details>}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* HB DATABASE TAB */}
        {activeTab === 'hbdb' && (
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {(['books', 'news', 'upcoming', 'contacts'] as const).map(tab => (
                <button key={tab} className={subTabClass(tab, dbSubTab)} onClick={() => { setDbSubTab(tab); setEditingId(null); }}>
                  {tab === 'books' && <BookOpen size={14} />}
                  {tab === 'news' && <Newspaper size={14} />}
                  {tab === 'upcoming' && <Clock size={14} />}
                  {tab === 'contacts' && <Mail size={14} />}
                  {tab === 'books' && 'Books'}
                  {tab === 'news' && 'News'}
                  {tab === 'upcoming' && 'Upcoming'}
                  {tab === 'contacts' && 'Contact Messages'}
                </button>
              ))}
            </div>

            {/* Books */}
            {dbSubTab === 'books' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input className={inputClass} placeholder="Title" value={editBook.title} onChange={e => setEditBook({ ...editBook, title: e.target.value })} />
                  <input className={inputClass} placeholder="Series (optional)" value={editBook.series} onChange={e => setEditBook({ ...editBook, series: e.target.value })} />
                  <div className="col-span-2 flex gap-2 items-center">
                    <input className={inputClass} placeholder="Cover image path" value={editBook.cover_image} onChange={e => setEditBook({ ...editBook, cover_image: e.target.value })} />
                    <ImagePicker value={editBook.cover_image} onChange={(url) => setEditBook({ ...editBook, cover_image: url })} />
                  </div>
                  <input className={inputClass} placeholder="UBL Link" value={editBook.ubl_link} onChange={e => setEditBook({ ...editBook, ubl_link: e.target.value })} />
                </div>
                <textarea className={inputClass + ' resize-none'} rows={3} placeholder="Description" value={editBook.description} onChange={e => setEditBook({ ...editBook, description: e.target.value })} />
                <Button variant="hero" size="sm" onClick={saveBook}>
                  {editingId ? <><Save size={14} /> Update Book</> : <><Plus size={14} /> Add Book</>}
                </Button>
                <div className="space-y-2 mt-4">
                  {books.length === 0 ? <p className="text-gray-400 text-center py-4">No books yet.</p> : books.map(b => (
                    <div key={b.id} className="flex items-center justify-between bg-gray-700/50 p-3 rounded text-sm">
                      <div className="flex items-center gap-2">
                        {b.cover_image && <img src={b.cover_image} alt="" className="h-8 w-8 object-cover rounded" />}
                        <span className="font-medium">{b.title}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditBook(b); setEditingId(b.id!); }} className="text-gold hover:text-gold/80"><Edit2 size={14} /></button>
                        <button onClick={() => deleteBook(b.id!)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* News */}
            {dbSubTab === 'news' && (
              <div className="space-y-4">
                <input className={inputClass} placeholder="Title" value={editNews.title} onChange={e => setEditNews({ ...editNews, title: e.target.value })} />
                <textarea className={inputClass + ' resize-none'} rows={4} placeholder="Content" value={editNews.content} onChange={e => setEditNews({ ...editNews, content: e.target.value })} />
                <Button variant="hero" size="sm" onClick={saveNews}>
                  {editingId ? <><Save size={14} /> Update News</> : <><Plus size={14} /> Add News</>}
                </Button>
                <div className="space-y-2 mt-4">
                  {news.length === 0 ? <p className="text-gray-400 text-center py-4">No news posts yet.</p> : news.map(n => (
                    <div key={n.id} className="flex items-center justify-between bg-gray-700/50 p-3 rounded text-sm">
                      <span className="font-medium">{n.title}</span>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditNews(n); setEditingId(n.id!); }} className="text-gold hover:text-gold/80"><Edit2 size={14} /></button>
                        <button onClick={() => deleteNews(n.id!)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming */}
            {dbSubTab === 'upcoming' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input className={inputClass} placeholder="Title" value={editUpcoming.title} onChange={e => setEditUpcoming({ ...editUpcoming, title: e.target.value })} />
                  <input className={inputClass} placeholder="Estimated Date" type="date" value={editUpcoming.estimated_date} onChange={e => setEditUpcoming({ ...editUpcoming, estimated_date: e.target.value })} />
                  <div className="col-span-2 flex gap-2 items-center">
                    <input className={inputClass} placeholder="Cover image path" value={editUpcoming.cover_image} onChange={e => setEditUpcoming({ ...editUpcoming, cover_image: e.target.value })} />
                    <ImagePicker value={editUpcoming.cover_image} onChange={(url) => setEditUpcoming({ ...editUpcoming, cover_image: url })} />
                  </div>
                </div>
                <textarea className={inputClass + ' resize-none'} rows={3} placeholder="Description" value={editUpcoming.description} onChange={e => setEditUpcoming({ ...editUpcoming, description: e.target.value })} />
                <Button variant="hero" size="sm" onClick={saveUpcoming}>
                  {editingId ? <><Save size={14} /> Update</> : <><Plus size={14} /> Add Upcoming</>}
                </Button>
                <div className="space-y-2 mt-4">
                  {upcoming.length === 0 ? <p className="text-gray-400 text-center py-4">No upcoming books yet.</p> : upcoming.map(u => (
                    <div key={u.id} className="flex items-center justify-between bg-gray-700/50 p-3 rounded text-sm">
                      <div className="flex items-center gap-2">
                        {u.cover_image && <img src={u.cover_image} alt="" className="h-8 w-8 object-cover rounded" />}
                        <span className="font-medium">{u.title}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditUpcoming(u); setEditingId(u.id!); }} className="text-gold hover:text-gold/80"><Edit2 size={14} /></button>
                        <button onClick={() => deleteUpcoming(u.id!)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Messages */}
            {dbSubTab === 'contacts' && (
              <div className="space-y-4">
                {contacts.length === 0 ? <p className="text-gray-400 text-center py-4">No messages yet.</p> : (
                  <div className="grid gap-3">
                    {contacts.map(msg => (
                      <div key={msg.id} className="bg-gray-700/50 p-4 rounded-lg">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <p className="font-semibold text-gold">{msg.name}</p>
                            <p className="text-sm text-gray-400">{msg.email}</p>
                            <p className="mt-2 text-sm text-gray-300">{msg.message}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${msg.replied ? 'bg-green-600' : 'bg-yellow-600'}`}>
                              {msg.replied ? 'Replied' : 'Pending'}
                            </span>
                            <button onClick={() => toggleReplied(msg.id!, msg.replied)} className="text-gold hover:text-gold/80">
                              <Reply size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* CONTENT TAB */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            {/* Reviews section */}
            <div>
              <h3 className="font-display text-lg mb-3 flex items-center gap-2"><Eye size={18} /> Manage Reviews</h3>
              {reviews.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No reviews yet.</p>
              ) : (
                reviews.map(r => (
                  <div key={r.id} className="bg-gray-700/50 p-3 rounded mb-2 text-sm">
                    <div className="flex justify-between flex-wrap gap-2">
                      <div>
                        <span className="font-semibold">{r.reviewer_name} (⭐ {r.rating}/5)</span>
                        <p className="mt-1">{r.review_text}</p>
                      </div>
                      <div className="flex gap-2 items-start">
                        {!r.approved && (
                          <button onClick={() => approveReview(r.id!, true)} className="text-green-500 hover:text-green-400"><CheckCircle size={16} /></button>
                        )}
                        {r.approved && (
                          <button onClick={() => approveReview(r.id!, false)} className="text-yellow-500 hover:text-yellow-400"><EyeOff size={16} /></button>
                        )}
                        <button onClick={() => deleteReview(r.id!)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{r.approved ? 'Approved' : 'Pending approval'}</p>
                  </div>
                ))
              )}
            </div>
            <div>
              <h3 className="font-display text-lg mb-3">Live Pages Content</h3>
              <p className="text-sm text-gray-400 mb-2">Quick links to edit content that appears on the frontend:</p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => { setActiveTab('hbdb'); setDbSubTab('books'); }}><BookOpen size={14} className="mr-2" /> Edit Books</Button>
                <Button variant="outline" size="sm" onClick={() => { setActiveTab('hbdb'); setDbSubTab('news'); }}><Newspaper size={14} className="mr-2" /> Edit News</Button>
                <Button variant="outline" size="sm" onClick={() => { setActiveTab('hbdb'); setDbSubTab('upcoming'); }}><Clock size={14} className="mr-2" /> Edit Upcoming</Button>
                <Button variant="outline" size="sm" onClick={() => { setActiveTab('hbdb'); setDbSubTab('contacts'); }}><Mail size={14} className="mr-2" /> View Contact Messages</Button>
              </div>
            </div>
          </div>
        )}

        {/* LOGS TAB – Only the detailed logs, separate from toggle panel */}
        {activeTab === 'logs' && (
          <div>
            <div className="flex gap-2 mb-4">
              <button className={subTabClass('activity', logsSubTab)} onClick={() => setLogsSubTab('activity')}>Activity Logs</button>
              <button className={subTabClass('errors', logsSubTab)} onClick={() => setLogsSubTab('errors')}>System Errors</button>
            </div>
            {logsSubTab === 'activity' && (
              <div className="overflow-auto max-h-96">
                {logs.length === 0 ? <p className="text-gray-400 text-center py-4">No activity logged yet.</p> : (
                  <table className="w-full text-sm">
                    <thead className="text-left text-gray-400 border-b border-gray-700">
                      <tr><th>Time</th><th>User</th><th>Action</th><th>Table</th><th>Details</th></tr>
                    </thead>
                    <tbody>
                      {logs.map(l => (
                        <tr key={l.id} className="border-b border-gray-700/50">
                          <td className="py-2">{new Date(l.created_at).toLocaleString()}</td>
                          <td>{l.admin_user}</td>
                          <td>{l.action}</td>
                          <td>{l.table_name}</td>
                          <td className="max-w-xs truncate">{JSON.stringify(l.details)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
            {logsSubTab === 'errors' && (
              <div className="overflow-auto max-h-96">
                {errors.length === 0 ? <p className="text-gray-400 text-center py-4">No errors recorded.</p> : (
                  errors.map(e => (
                    <div key={e.id} className="bg-red-900/20 border border-red-500/30 p-3 rounded mb-2 text-sm">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{new Date(e.created_at).toLocaleString()}</span>
                        <span>{e.url}</span>
                      </div>
                      <p className="font-mono text-red-400">{e.error_message}</p>
                      {e.error_stack && <details className="mt-2"><summary className="cursor-pointer">Stack trace</summary><pre className="text-xs text-red-300 overflow-auto max-h-40">{e.error_stack}</pre></details>}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
