'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import {
  BookOpen,
  FileText,
  Clock,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Eye,
  EyeOff,
  Check,
  X,
  MessageSquare,
  AlertCircle,
  Loader2,
  LogsIcon,
  Star,
  Calendar,
  User,
  Mail,
} from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Book {
  id: string;
  title: string;
  cover_image: string;          // stored path
  cover_image_url?: string;     // signed URL for display
  description: string;
  ubl: string;
  published: boolean;
  created_at: string;
}

interface NewsPost {
  id: string;
  title: string;
  content: string;
  date: string;
  published: boolean;
  created_at: string;
}

interface UpcomingBook {
  id: string;
  title: string;
  cover_image: string;          // stored path
  cover_image_url?: string;     // signed URL for display
  description: string;
  estimated_date: string;
  created_at: string;
}

interface Review {
  id: string;
  reviewer_name: string;
  review_text: string;
  rating: number;
  approved: boolean;
  created_at: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  replied: boolean;
  created_at: string;
}

interface AdminLog {
  id: string;
  admin_user: string;
  action: string;
  table_name: string;
  record_id: string;
  details: Record<string, any>;
  created_at: string;
}

interface SystemError {
  id: string;
  error_message: string;
  error_stack?: string;
  url: string;
  user_agent: string;
  created_at: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ADMIN_EMAIL = 'admin@hpbooks.uk';
const BUCKET_NAME = 'covers';
const GOLD_COLOR = '#B8A27A';

const emptyBook: Omit<Book, 'id' | 'created_at' | 'cover_image_url'> = {
  title: '',
  cover_image: '',
  description: '',
  ubl: '',
  published: false,
};

const emptyNewsPost: Omit<NewsPost, 'id' | 'created_at'> = {
  title: '',
  content: '',
  date: new Date().toISOString(),
  published: false,
};

const emptyUpcomingBook: Omit<UpcomingBook, 'id' | 'created_at' | 'cover_image_url'> = {
  title: '',
  cover_image: '',
  description: '',
  estimated_date: format(new Date(), 'yyyy-MM-dd'),
};

const emptyReview: Omit<Review, 'id' | 'created_at'> = {
  reviewer_name: '',
  review_text: '',
  rating: 5,
  approved: false,
};

// ============================================================================
// SUPABASE HELPER FUNCTIONS
// ============================================================================

/**
 * Log admin action to the admin_logs table
 */
const logAction = async (
  adminUser: string,
  action: string,
  tableName: string,
  recordId: string,
  details?: Record<string, any>
) => {
  try {
    await supabase.from('admin_logs').insert({
      admin_user: adminUser,
      action,
      table_name: tableName,
      record_id: recordId,
      details: details || {},
    });
  } catch (err) {
    console.error('Failed to log admin action:', err);
  }
};

/**
 * Get a signed URL for a private bucket file
 */
const getSignedUrl = async (filePath: string): Promise<string> => {
  try {
    const { data } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 3600); // 1 hour expiry
    return data?.signedUrl || '';
  } catch (err) {
    console.error('Failed to get signed URL:', err);
    return '';
  }
};

/**
 * Upload an image to the covers bucket
 */
const uploadImage = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<string | null> => {
  try {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file);

    if (error) throw error;
    return data?.path || null;
  } catch (err) {
    console.error('Image upload failed:', err);
    return null;
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // ========== Authentication State ==========
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState('');

  // ========== UI State ==========
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showLogsPanel, setShowLogsPanel] = useState(false);   // toggle header logs panel
  const [activeTab, setActiveTab] = useState<'hbdb' | 'content' | 'logs'>('hbdb');
  const [dbSubTab, setDbSubTab] = useState<'books' | 'news' | 'upcoming' | 'contact'>('books');
  const [logsSubTab, setLogsSubTab] = useState<'activity' | 'errors'>('activity');

  // ========== Data State ==========
  const [books, setBooks] = useState<Book[]>([]);
  const [newsPosts, setNewsPosts] = useState<NewsPost[]>([]);
  const [upcomingBooks, setUpcomingBooks] = useState<UpcomingBook[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
  const [systemErrors, setSystemErrors] = useState<SystemError[]>([]);

  // ========== Form State ==========
  const [editingBook, setEditingBook] = useState<Partial<Book> | null>(null);
  const [bookFormData, setBookFormData] = useState<Partial<Book>>(emptyBook);
  const [bookImagePreview, setBookImagePreview] = useState<string>('');
  const [bookImageUploading, setBookImageUploading] = useState(false);

  const [editingNews, setEditingNews] = useState<Partial<NewsPost> | null>(null);
  const [newsFormData, setNewsFormData] = useState<Partial<NewsPost>>(emptyNewsPost);

  const [editingUpcoming, setEditingUpcoming] = useState<Partial<UpcomingBook> | null>(null);
  const [upcomingFormData, setUpcomingFormData] = useState<Partial<UpcomingBook>>(emptyUpcomingBook);
  const [upcomingImagePreview, setUpcomingImagePreview] = useState<string>('');
  const [upcomingImageUploading, setUpcomingImageUploading] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ========== Authentication Effects ==========
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setIsAuthenticated(true);
          setUserEmail(session.user.email || null);

          if (session.user.email === ADMIN_EMAIL) {
            setIsAuthorized(true);
            setAccessDeniedMessage('');
          } else {
            setIsAuthorized(false);
            setAccessDeniedMessage(`Access denied. Logged in as: ${session.user.email}`);
          }
        } else {
          setIsAuthenticated(false);
          setIsAuthorized(false);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setUserEmail(session.user.email || null);

        if (session.user.email === ADMIN_EMAIL) {
          setIsAuthorized(true);
          setAccessDeniedMessage('');
        } else {
          setIsAuthorized(false);
          setAccessDeniedMessage(`Access denied. Logged in as: ${session.user.email}`);
        }
      } else {
        setIsAuthenticated(false);
        setIsAuthorized(false);
        setUserEmail(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  // ========== Clock Effect ==========
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ========== Data Fetching ==========
  const fetchAll = useCallback(async () => {
    if (!isAuthorized) return;

    try {
      setIsLoading(true);

      const [booksRes, newsRes, upcomingRes, reviewsRes, messagesRes, logsRes, errorsRes] =
        await Promise.all([
          supabase.from('books').select('*').order('created_at', { ascending: false }),
          supabase.from('news_posts').select('*').order('date', { ascending: false }),
          supabase.from('upcoming_books').select('*').order('created_at', { ascending: false }),
          supabase.from('reviews').select('*').order('created_at', { ascending: false }),
          supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
          supabase
            .from('admin_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100),
          supabase.from('system_errors').select('*').order('created_at', { ascending: false }),
        ]);

      // Process books with signed URLs for cover images
      if (booksRes.data) {
        const booksWithUrls = await Promise.all(
          booksRes.data.map(async (book) => ({
            ...book,
            cover_image_url: book.cover_image ? await getSignedUrl(book.cover_image) : '',
          }))
        );
        setBooks(booksWithUrls);
      }

      // Process upcoming books with signed URLs
      if (upcomingRes.data) {
        const upcomingWithUrls = await Promise.all(
          upcomingRes.data.map(async (book) => ({
            ...book,
            cover_image_url: book.cover_image ? await getSignedUrl(book.cover_image) : '',
          }))
        );
        setUpcomingBooks(upcomingWithUrls);
      }

      if (newsRes.data) setNewsPosts(newsRes.data);
      if (reviewsRes.data) setReviews(reviewsRes.data);
      if (messagesRes.data) setContactMessages(messagesRes.data);
      if (logsRes.data) setAdminLogs(logsRes.data);
      if (errorsRes.data) setSystemErrors(errorsRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthorized, toast]);

  // Fetch data on mount and when authorized
  useEffect(() => {
    if (isAuthorized) {
      fetchAll();
    }
  }, [isAuthorized, fetchAll]);

  // ========== Authentication Handlers ==========
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        toast({
          title: 'Login Failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setLoginEmail('');
        setLoginPassword('');
        toast({
          title: 'Success',
          description: 'Logged in successfully',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Login failed. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setIsAuthorized(false);
      setUserEmail(null);
      navigate('/');
      toast({
        title: 'Success',
        description: 'Logged out successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Logout failed',
        variant: 'destructive',
      });
    }
  };

  // ========== BOOKS CRUD ==========
  const handleSaveBook = async () => {
    if (!bookFormData.title || !bookFormData.description) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      if (editingBook?.id) {
        // Update
        const { error } = await supabase
          .from('books')
          .update({
            title: bookFormData.title,
            cover_image: bookFormData.cover_image,
            description: bookFormData.description,
            ubl: bookFormData.ubl,
            published: bookFormData.published,
          })
          .eq('id', editingBook.id);

        if (error) throw error;

        await logAction(userEmail || '', 'UPDATE', 'books', editingBook.id, {
          title: bookFormData.title,
        });

        toast({ title: 'Success', description: 'Book updated' });
      } else {
        // Insert
        const { data, error } = await supabase
          .from('books')
          .insert({
            title: bookFormData.title,
            cover_image: bookFormData.cover_image,
            description: bookFormData.description,
            ubl: bookFormData.ubl,
            published: bookFormData.published,
          })
          .select();  // <- get the new id

        if (error) throw error;

        const newId = data?.[0]?.id || '';
        await logAction(userEmail || '', 'INSERT', 'books', newId, {
          title: bookFormData.title,
        });

        toast({ title: 'Success', description: 'Book created' });
      }

      setBookFormData(emptyBook);
      setBookImagePreview('');
      setEditingBook(null);
      fetchAll();
    } catch (err) {
      console.error('Failed to save book:', err);
      toast({
        title: 'Error',
        description: 'Failed to save book',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
      const { error } = await supabase.from('books').delete().eq('id', id);

      if (error) throw error;

      await logAction(userEmail || '', 'DELETE', 'books', id, {});

      toast({ title: 'Success', description: 'Book deleted' });
      fetchAll();
    } catch (err) {
      console.error('Failed to delete book:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete book',
        variant: 'destructive',
      });
    }
  };

  const handleEditBook = async (book: Book) => {
    setEditingBook(book);
    setBookFormData(book);

    if (book.cover_image) {
      const signedUrl = await getSignedUrl(book.cover_image);
      setBookImagePreview(signedUrl);
    }
  };

  const handleBookImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBookImageUploading(true);

    try {
      const filePath = await uploadImage(file);
      if (filePath) {
        setBookFormData({ ...bookFormData, cover_image: filePath });
        const signedUrl = await getSignedUrl(filePath);
        setBookImagePreview(signedUrl);
        toast({ title: 'Success', description: 'Image uploaded' });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Image upload failed',
        variant: 'destructive',
      });
    } finally {
      setBookImageUploading(false);
    }
  };

  // ========== NEWS CRUD ==========
  const handleSaveNews = async () => {
    if (!newsFormData.title || !newsFormData.content) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      if (editingNews?.id) {
        // Update
        const { error } = await supabase
          .from('news_posts')
          .update({
            title: newsFormData.title,
            content: newsFormData.content,
            date: newsFormData.date,
            published: newsFormData.published,
          })
          .eq('id', editingNews.id);

        if (error) throw error;

        await logAction(userEmail || '', 'UPDATE', 'news_posts', editingNews.id, {
          title: newsFormData.title,
        });

        toast({ title: 'Success', description: 'News post updated' });
      } else {
        // Insert
        const { data, error } = await supabase
          .from('news_posts')
          .insert({
            title: newsFormData.title,
            content: newsFormData.content,
            date: newsFormData.date,
            published: newsFormData.published,
          })
          .select();

        if (error) throw error;

        const newId = data?.[0]?.id || '';
        await logAction(userEmail || '', 'INSERT', 'news_posts', newId, {
          title: newsFormData.title,
        });

        toast({ title: 'Success', description: 'News post created' });
      }

      setNewsFormData(emptyNewsPost);
      setEditingNews(null);
      fetchAll();
    } catch (err) {
      console.error('Failed to save news:', err);
      toast({
        title: 'Error',
        description: 'Failed to save news post',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news post?')) return;

    try {
      const { error } = await supabase.from('news_posts').delete().eq('id', id);

      if (error) throw error;

      await logAction(userEmail || '', 'DELETE', 'news_posts', id, {});

      toast({ title: 'Success', description: 'News post deleted' });
      fetchAll();
    } catch (err) {
      console.error('Failed to delete news:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete news post',
        variant: 'destructive',
      });
    }
  };

  const handleEditNews = (newsPost: NewsPost) => {
    setEditingNews(newsPost);
    setNewsFormData(newsPost);
  };

  // ========== UPCOMING BOOKS CRUD ==========
  const handleSaveUpcoming = async () => {
    if (!upcomingFormData.title || !upcomingFormData.description) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      if (editingUpcoming?.id) {
        // Update
        const { error } = await supabase
          .from('upcoming_books')
          .update({
            title: upcomingFormData.title,
            cover_image: upcomingFormData.cover_image,
            description: upcomingFormData.description,
            estimated_date: upcomingFormData.estimated_date,
          })
          .eq('id', editingUpcoming.id);

        if (error) throw error;

        await logAction(userEmail || '', 'UPDATE', 'upcoming_books', editingUpcoming.id, {
          title: upcomingFormData.title,
        });

        toast({ title: 'Success', description: 'Upcoming book updated' });
      } else {
        // Insert
        const { data, error } = await supabase
          .from('upcoming_books')
          .insert({
            title: upcomingFormData.title,
            cover_image: upcomingFormData.cover_image,
            description: upcomingFormData.description,
            estimated_date: upcomingFormData.estimated_date,
          })
          .select();

        if (error) throw error;

        const newId = data?.[0]?.id || '';
        await logAction(userEmail || '', 'INSERT', 'upcoming_books', newId, {
          title: upcomingFormData.title,
        });

        toast({ title: 'Success', description: 'Upcoming book created' });
      }

      setUpcomingFormData(emptyUpcomingBook);
      setUpcomingImagePreview('');
      setEditingUpcoming(null);
      fetchAll();
    } catch (err) {
      console.error('Failed to save upcoming book:', err);
      toast({
        title: 'Error',
        description: 'Failed to save upcoming book',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUpcoming = async (id: string) => {
    if (!confirm('Are you sure you want to delete this upcoming book?')) return;

    try {
      const { error } = await supabase.from('upcoming_books').delete().eq('id', id);

      if (error) throw error;

      await logAction(userEmail || '', 'DELETE', 'upcoming_books', id, {});

      toast({ title: 'Success', description: 'Upcoming book deleted' });
      fetchAll();
    } catch (err) {
      console.error('Failed to delete upcoming book:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete upcoming book',
        variant: 'destructive',
      });
    }
  };

  const handleEditUpcoming = async (book: UpcomingBook) => {
    setEditingUpcoming(book);
    setUpcomingFormData(book);

    if (book.cover_image) {
      const signedUrl = await getSignedUrl(book.cover_image);
      setUpcomingImagePreview(signedUrl);
    }
  };

  const handleUpcomingImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUpcomingImageUploading(true);

    try {
      const filePath = await uploadImage(file);
      if (filePath) {
        setUpcomingFormData({ ...upcomingFormData, cover_image: filePath });
        const signedUrl = await getSignedUrl(filePath);
        setUpcomingImagePreview(signedUrl);
        toast({ title: 'Success', description: 'Image uploaded' });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Image upload failed',
        variant: 'destructive',
      });
    } finally {
      setUpcomingImageUploading(false);
    }
  };

  // ========== REVIEWS CRUD ==========
  const handleApproveReview = async (id: string) => {
    try {
      const { error } = await supabase.from('reviews').update({ approved: true }).eq('id', id);

      if (error) throw error;

      await logAction(userEmail || '', 'APPROVE', 'reviews', id, {});

      toast({ title: 'Success', description: 'Review approved' });
      fetchAll();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to approve review',
        variant: 'destructive',
      });
    }
  };

  const handleRejectReview = async (id: string) => {
    try {
      const { error } = await supabase.from('reviews').update({ approved: false }).eq('id', id);

      if (error) throw error;

      await logAction(userEmail || '', 'REJECT', 'reviews', id, {});

      toast({ title: 'Success', description: 'Review rejected' });
      fetchAll();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to reject review',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const { error } = await supabase.from('reviews').delete().eq('id', id);

      if (error) throw error;

      await logAction(userEmail || '', 'DELETE', 'reviews', id, {});

      toast({ title: 'Success', description: 'Review deleted' });
      fetchAll();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete review',
        variant: 'destructive',
      });
    }
  };

  // ========== CONTACT MESSAGES ==========
 const handleToggleMessageReply = async (id: string, currentReplied: boolean) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/toggle-message-reply`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, currentReplied }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update message');
    }

    toast({
      title: 'Success',
      description: `Message marked as ${data.newReplied ? 'replied' : 'pending'}`,
    });

    // Refresh the contact messages list
    fetchAll();
  } catch (err: any) {
    toast({
      title: 'Error',
      description: err.message || 'Failed to update message',
      variant: 'destructive',
    });
  }
};
  // ========== LOGIN FORM (if not authenticated) ==========
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-8">
          <div className="flex justify-center mb-6">
            <img
              src="/assets/favicon/web-app-manifest-192x192.png"
              alt="Logo"
              className="w-16 h-16 rounded"
            />
          </div>

          <h1 className="text-3xl font-bold text-white text-center mb-2">Admin Dashboard</h1>
          <p className="text-gray-400 text-center mb-8">Sign in to continue</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@hpbooks.uk"
                disabled={isLoggingIn}
                className="w-full bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 rounded px-4 py-2 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoggingIn}
                className="w-full bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 rounded px-4 py-2 transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white font-medium py-2 rounded transition flex items-center justify-center gap-2"
            >
              {isLoggingIn && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign In
            </button>
          </form>

          <p className="text-gray-400 text-xs text-center mt-6">
            This is a secure admin area. Only authorized personnel should attempt access.
          </p>
        </div>
      </div>
    );
  }

  // ========== ACCESS DENIED ==========
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-red-900/20 border border-red-500 rounded-lg shadow-2xl p-8">
          <div className="flex justify-center mb-6">
            <AlertCircle className="w-16 h-16 text-red-500" />
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-2">Access Denied</h1>
          <p className="text-gray-300 text-center mb-4">{accessDeniedMessage}</p>
          <p className="text-gray-400 text-center text-sm mb-6">
            You do not have permission to access this admin dashboard.
          </p>

          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // ========== MAIN DASHBOARD ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
      {/* Header */}
      <header className="bg-gray-800/50 border-b border-gray-700 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/assets/favicon/web-app-manifest-192x192.png"
                alt="Logo"
                className="w-10 h-10 rounded"
              />
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-gray-400 text-sm">{userEmail}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xl font-mono text-yellow-500">
                  {format(currentTime, 'HH:mm:ss')}
                </p>
                <p className="text-sm text-gray-400">{format(currentTime, 'EEEE')}</p>
              </div>

              <button
                onClick={() => setShowLogsPanel(!showLogsPanel)}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm flex items-center gap-2 transition"
              >
                <LogsIcon className="w-4 h-4" />
                {showLogsPanel ? 'Hide Logs' : 'Show Logs'}
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Compact Logs Panel (toggled) */}
          {showLogsPanel && (
            <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <h3 className="text-sm font-semibold text-white mb-2">Recent Activity</h3>
              {adminLogs.length === 0 ? (
                <p className="text-gray-400 text-xs">No recent activity.</p>
              ) : (
                <div className="space-y-1 max-h-40 overflow-auto">
                  {adminLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="text-xs text-gray-300">
                      <span className="text-yellow-500">{new Date(log.created_at).toLocaleTimeString()}</span>
                      {' '}
                      {log.admin_user} {log.action} {log.table_name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-96">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
          </div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="flex gap-4 mb-8 border-b border-gray-700">
              <button
                onClick={() => setActiveTab('hbdb')}
                className={`px-6 py-3 font-medium transition ${
                  activeTab === 'hbdb'
                    ? 'text-yellow-500 border-b-2 border-yellow-500'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <BookOpen className="inline w-5 h-5 mr-2" />
                HB Database
              </button>

              <button
                onClick={() => setActiveTab('content')}
                className={`px-6 py-3 font-medium transition ${
                  activeTab === 'content'
                    ? 'text-yellow-500 border-b-2 border-yellow-500'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <FileText className="inline w-5 h-5 mr-2" />
                Content
              </button>

              <button
                onClick={() => setActiveTab('logs')}
                className={`px-6 py-3 font-medium transition ${
                  activeTab === 'logs'
                    ? 'text-yellow-500 border-b-2 border-yellow-500'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <LogsIcon className="inline w-5 h-5 mr-2" />
                Logs
              </button>
            </div>

            {/* ==================== HB DATABASE TAB ==================== */}
            {activeTab === 'hbdb' && (
              <div>
                {/* Sub-tabs */}
                <div className="flex gap-4 mb-6 border-b border-gray-700">
                  <button
                    onClick={() => setDbSubTab('books')}
                    className={`px-4 py-2 text-sm font-medium transition ${
                      dbSubTab === 'books'
                        ? 'text-yellow-500 border-b-2 border-yellow-500'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    Books
                  </button>
                  <button
                    onClick={() => setDbSubTab('news')}
                    className={`px-4 py-2 text-sm font-medium transition ${
                      dbSubTab === 'news'
                        ? 'text-yellow-500 border-b-2 border-yellow-500'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    News
                  </button>
                  <button
                    onClick={() => setDbSubTab('upcoming')}
                    className={`px-4 py-2 text-sm font-medium transition ${
                      dbSubTab === 'upcoming'
                        ? 'text-yellow-500 border-b-2 border-yellow-500'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    Upcoming
                  </button>
                  <button
                    onClick={() => setDbSubTab('contact')}
                    className={`px-4 py-2 text-sm font-medium transition ${
                      dbSubTab === 'contact'
                        ? 'text-yellow-500 border-b-2 border-yellow-500'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    Contact
                  </button>
                </div>

                {/* BOOKS SUB-TAB */}
                {dbSubTab === 'books' && (
                  <div className="space-y-8">
                    {/* Form */}
                    <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">
                        {editingBook ? 'Edit Book' : 'Add New Book'}
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Title *
                          </label>
                          <input
                            type="text"
                            value={bookFormData.title || ''}
                            onChange={(e) =>
                              setBookFormData({ ...bookFormData, title: e.target.value })
                            }
                            disabled={isSaving}
                            placeholder="Book title"
                            className="w-full bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 rounded px-4 py-2 transition"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Description *
                          </label>
                          <textarea
                            value={bookFormData.description || ''}
                            onChange={(e) =>
                              setBookFormData({ ...bookFormData, description: e.target.value })
                            }
                            disabled={isSaving}
                            placeholder="Book description"
                            rows={4}
                            className="w-full bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 rounded px-4 py-2 transition"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Cover Image
                          </label>
                          <div className="flex gap-4">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleBookImageUpload}
                              disabled={bookImageUploading || isSaving}
                              className="flex-1 bg-gray-800/50 border border-gray-600 text-gray-300 px-4 py-2 rounded cursor-pointer hover:bg-gray-800 transition"
                            />
                            {bookImageUploading && (
                              <Loader2 className="w-4 h-4 animate-spin text-yellow-500 self-center" />
                            )}
                          </div>
                          {bookImagePreview && (
                            <img
                              src={bookImagePreview}
                              alt="Preview"
                              className="mt-3 w-32 h-48 object-cover rounded"
                            />
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            UBL Link
                          </label>
                          <input
                            type="url"
                            value={bookFormData.ubl || ''}
                            onChange={(e) =>
                              setBookFormData({ ...bookFormData, ubl: e.target.value })
                            }
                            disabled={isSaving}
                            placeholder="https://..."
                            className="w-full bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 rounded px-4 py-2 transition"
                          />
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={bookFormData.published || false}
                            onChange={(e) =>
                              setBookFormData({ ...bookFormData, published: e.target.checked })
                            }
                            disabled={isSaving}
                            className="w-4 h-4"
                          />
                          <span className="text-gray-300">Published</span>
                        </label>

                        <div className="flex gap-3">
                          <button
                            onClick={handleSaveBook}
                            disabled={isSaving}
                            className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white font-medium py-2 rounded transition flex items-center justify-center gap-2"
                          >
                            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                            {editingBook ? 'Update Book' : 'Add Book'}
                          </button>

                          {editingBook && (
                            <button
                              onClick={() => {
                                setEditingBook(null);
                                setBookFormData(emptyBook);
                                setBookImagePreview('');
                              }}
                              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* List */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Books List</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {books.length === 0 ? (
                          <p className="text-gray-400 col-span-full">No books found.</p>
                        ) : (
                          books.map((book) => (
                            <div
                              key={book.id}
                              className="bg-gray-800/30 border border-gray-700 rounded-lg overflow-hidden hover:border-yellow-500/50 transition"
                            >
                              {book.cover_image_url && (
                                <img
                                  src={book.cover_image_url}
                                  alt={book.title}
                                  className="w-full h-40 object-cover"
                                />
                              )}
                              <div className="p-4 space-y-3">
                                <h4 className="font-semibold text-white line-clamp-2">
                                  {book.title}
                                </h4>
                                <p className="text-sm text-gray-400 line-clamp-2">
                                  {book.description}
                                </p>
                                {book.published && (
                                  <span className="inline-block bg-green-600 text-white text-xs px-2 py-1 rounded">
                                    Published
                                  </span>
                                )}
                                <div className="flex gap-2 pt-2">
                                  <button
                                    onClick={() => handleEditBook(book)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1 rounded text-sm flex items-center justify-center gap-1 transition"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteBook(book.id)}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 rounded text-sm flex items-center justify-center gap-1 transition"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* NEWS SUB-TAB */}
                {dbSubTab === 'news' && (
                  <div className="space-y-8">
                    {/* Form */}
                    <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">
                        {editingNews ? 'Edit News Post' : 'Add News Post'}
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Title *
                          </label>
                          <input
                            type="text"
                            value={newsFormData.title || ''}
                            onChange={(e) =>
                              setNewsFormData({ ...newsFormData, title: e.target.value })
                            }
                            disabled={isSaving}
                            placeholder="News title"
                            className="w-full bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 rounded px-4 py-2 transition"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Content *
                          </label>
                          <textarea
                            value={newsFormData.content || ''}
                            onChange={(e) =>
                              setNewsFormData({ ...newsFormData, content: e.target.value })
                            }
                            disabled={isSaving}
                            placeholder="News content"
                            rows={5}
                            className="w-full bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 rounded px-4 py-2 transition"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Date
                          </label>
                          <input
                            type="datetime-local"
                            value={
                              newsFormData.date
                                ? format(new Date(newsFormData.date), "yyyy-MM-dd'T'HH:mm")
                                : ''
                            }
                            onChange={(e) =>
                              setNewsFormData({
                                ...newsFormData,
                                date: new Date(e.target.value).toISOString(),
                              })
                            }
                            disabled={isSaving}
                            className="w-full bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 rounded px-4 py-2 transition"
                          />
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newsFormData.published || false}
                            onChange={(e) =>
                              setNewsFormData({ ...newsFormData, published: e.target.checked })
                            }
                            disabled={isSaving}
                            className="w-4 h-4"
                          />
                          <span className="text-gray-300">Published</span>
                        </label>

                        <div className="flex gap-3">
                          <button
                            onClick={handleSaveNews}
                            disabled={isSaving}
                            className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white font-medium py-2 rounded transition flex items-center justify-center gap-2"
                          >
                            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                            {editingNews ? 'Update Post' : 'Add Post'}
                          </button>

                          {editingNews && (
                            <button
                              onClick={() => {
                                setEditingNews(null);
                                setNewsFormData(emptyNewsPost);
                              }}
                              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* List */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">News Posts</h3>
                      {newsPosts.length === 0 ? (
                        <p className="text-gray-400">No news posts found.</p>
                      ) : (
                        <div className="space-y-3">
                          {newsPosts.map((post) => (
                            <div
                              key={post.id}
                              className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 hover:border-yellow-500/50 transition"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-white">{post.title}</h4>
                                  <p className="text-sm text-gray-400">
                                    {format(new Date(post.date), 'PPpp')}
                                  </p>
                                </div>
                                {post.published && (
                                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                                    Published
                                  </span>
                                )}
                              </div>

                              <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                                {post.content}
                              </p>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditNews(post)}
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1 rounded text-sm flex items-center justify-center gap-1 transition"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteNews(post.id)}
                                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 rounded text-sm flex items-center justify-center gap-1 transition"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* UPCOMING BOOKS SUB-TAB */}
                {dbSubTab === 'upcoming' && (
                  <div className="space-y-8">
                    {/* Form */}
                    <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">
                        {editingUpcoming ? 'Edit Upcoming Book' : 'Add Upcoming Book'}
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Title *
                          </label>
                          <input
                            type="text"
                            value={upcomingFormData.title || ''}
                            onChange={(e) =>
                              setUpcomingFormData({ ...upcomingFormData, title: e.target.value })
                            }
                            disabled={isSaving}
                            placeholder="Book title"
                            className="w-full bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 rounded px-4 py-2 transition"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Description *
                          </label>
                          <textarea
                            value={upcomingFormData.description || ''}
                            onChange={(e) =>
                              setUpcomingFormData({
                                ...upcomingFormData,
                                description: e.target.value,
                              })
                            }
                            disabled={isSaving}
                            placeholder="Book description"
                            rows={4}
                            className="w-full bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 rounded px-4 py-2 transition"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Cover Image
                          </label>
                          <div className="flex gap-4">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleUpcomingImageUpload}
                              disabled={upcomingImageUploading || isSaving}
                              className="flex-1 bg-gray-800/50 border border-gray-600 text-gray-300 px-4 py-2 rounded cursor-pointer hover:bg-gray-800 transition"
                            />
                            {upcomingImageUploading && (
                              <Loader2 className="w-4 h-4 animate-spin text-yellow-500 self-center" />
                            )}
                          </div>
                          {upcomingImagePreview && (
                            <img
                              src={upcomingImagePreview}
                              alt="Preview"
                              className="mt-3 w-32 h-48 object-cover rounded"
                            />
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Estimated Release Date
                          </label>
                          <input
                            type="date"
                            value={upcomingFormData.estimated_date || ''}
                            onChange={(e) =>
                              setUpcomingFormData({
                                ...upcomingFormData,
                                estimated_date: e.target.value,
                              })
                            }
                            disabled={isSaving}
                            className="w-full bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 rounded px-4 py-2 transition"
                          />
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={handleSaveUpcoming}
                            disabled={isSaving}
                            className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white font-medium py-2 rounded transition flex items-center justify-center gap-2"
                          >
                            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                            {editingUpcoming ? 'Update Book' : 'Add Book'}
                          </button>

                          {editingUpcoming && (
                            <button
                              onClick={() => {
                                setEditingUpcoming(null);
                                setUpcomingFormData(emptyUpcomingBook);
                                setUpcomingImagePreview('');
                              }}
                              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* List */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Upcoming Books</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {upcomingBooks.length === 0 ? (
                          <p className="text-gray-400 col-span-full">No upcoming books found.</p>
                        ) : (
                          upcomingBooks.map((book) => (
                            <div
                              key={book.id}
                              className="bg-gray-800/30 border border-gray-700 rounded-lg overflow-hidden hover:border-yellow-500/50 transition"
                            >
                              {book.cover_image_url && (
                                <img
                                  src={book.cover_image_url}
                                  alt={book.title}
                                  className="w-full h-40 object-cover"
                                />
                              )}
                              <div className="p-4 space-y-3">
                                <h4 className="font-semibold text-white line-clamp-2">
                                  {book.title}
                                </h4>
                                <p className="text-sm text-gray-400 line-clamp-2">
                                  {book.description}
                                </p>
                                <p className="text-sm text-yellow-500 font-medium">
                                  <Calendar className="inline w-4 h-4 mr-1" />
                                  {format(new Date(book.estimated_date), 'PPP')}
                                </p>
                                <div className="flex gap-2 pt-2">
                                  <button
                                    onClick={() => handleEditUpcoming(book)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1 rounded text-sm flex items-center justify-center gap-1 transition"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUpcoming(book.id)}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 rounded text-sm flex items-center justify-center gap-1 transition"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* CONTACT MESSAGES SUB-TAB */}
                {dbSubTab === 'contact' && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Contact Messages</h3>

                    {contactMessages.length === 0 ? (
                      <p className="text-gray-400">No contact messages found.</p>
                    ) : (
                      <div className="space-y-3">
                        {contactMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 hover:border-yellow-500/50 transition"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-white">{msg.name}</h4>
                                <p className="text-sm text-gray-400">{msg.email}</p>
                                <p className="mt-1 text-gray-300">{msg.message}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs px-2 py-1 rounded ${
                                    msg.replied ? 'bg-green-600' : 'bg-yellow-600'
                                  }`}
                                >
                                  {msg.replied ? 'Replied' : 'Pending'}
                                </span>
                                <button
                                  onClick={() => handleToggleMessageReply(msg.id, msg.replied)}
                                  className="text-yellow-500 hover:text-yellow-400 transition"
                                >
                                  <MessageSquare className="w-4 h-4" />
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

            {/* ==================== CONTENT TAB ==================== */}
            {activeTab === 'content' && (
              <div className="space-y-8">
                {/* Reviews Section */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Manage Reviews
                  </h3>
                  {reviews.length === 0 ? (
                    <p className="text-gray-400">No reviews yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          className="bg-gray-800/30 border border-gray-700 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-white">
                                  {review.reviewer_name}
                                </span>
                                <span className="text-yellow-500">★ {review.rating}/5</span>
                                {review.approved && (
                                  <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded">
                                    Approved
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-300 text-sm">{review.review_text}</p>
                              <p className="text-gray-400 text-xs mt-1">
                                {format(new Date(review.created_at), 'PPP')}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {!review.approved && (
                                <button
                                  onClick={() => handleApproveReview(review.id)}
                                  className="p-1 text-green-500 hover:text-green-400"
                                  title="Approve"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              {review.approved && (
                                <button
                                  onClick={() => handleRejectReview(review.id)}
                                  className="p-1 text-yellow-500 hover:text-yellow-400"
                                  title="Reject"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteReview(review.id)}
                                className="p-1 text-red-500 hover:text-red-400"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Links */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Live Pages Content</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Quick links to edit content that appears on the frontend:
                  </p>
                  <div className="grid grid-cols-2 gap-3 max-w-md">
                    <button
                      onClick={() => {
                        setActiveTab('hbdb');
                        setDbSubTab('books');
                      }}
                      className="px-4 py-2 border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black rounded transition text-sm font-medium"
                    >
                      <BookOpen className="inline w-4 h-4 mr-2" />
                      Edit Books
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('hbdb');
                        setDbSubTab('news');
                      }}
                      className="px-4 py-2 border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black rounded transition text-sm font-medium"
                    >
                      <FileText className="inline w-4 h-4 mr-2" />
                      Edit News
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('hbdb');
                        setDbSubTab('upcoming');
                      }}
                      className="px-4 py-2 border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black rounded transition text-sm font-medium"
                    >
                      <Clock className="inline w-4 h-4 mr-2" />
                      Edit Upcoming
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('hbdb');
                        setDbSubTab('contact');
                      }}
                      className="px-4 py-2 border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black rounded transition text-sm font-medium"
                    >
                      <Mail className="inline w-4 h-4 mr-2" />
                      View Contact Messages
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== LOGS TAB ==================== */}
            {activeTab === 'logs' && (
              <div>
                <div className="flex gap-4 mb-6 border-b border-gray-700">
                  <button
                    onClick={() => setLogsSubTab('activity')}
                    className={`px-4 py-2 text-sm font-medium transition ${
                      logsSubTab === 'activity'
                        ? 'text-yellow-500 border-b-2 border-yellow-500'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    Activity Logs
                  </button>
                  <button
                    onClick={() => setLogsSubTab('errors')}
                    className={`px-4 py-2 text-sm font-medium transition ${
                      logsSubTab === 'errors'
                        ? 'text-yellow-500 border-b-2 border-yellow-500'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    System Errors
                  </button>
                </div>

                {logsSubTab === 'activity' && (
                  <div className="overflow-auto max-h-96">
                    {adminLogs.length === 0 ? (
                      <p className="text-gray-400">No activity logs found.</p>
                    ) : (
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-800/50 text-left text-gray-300">
                          <tr>
                            <th className="p-2">Time</th>
                            <th className="p-2">User</th>
                            <th className="p-2">Action</th>
                            <th className="p-2">Table</th>
                            <th className="p-2">Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminLogs.map((log) => (
                            <tr key={log.id} className="border-t border-gray-700">
                              <td className="p-2 text-gray-400">
                                {format(new Date(log.created_at), 'PPpp')}
                              </td>
                              <td className="p-2 text-gray-400">{log.admin_user}</td>
                              <td className="p-2 text-gray-400">{log.action}</td>
                              <td className="p-2 text-gray-400">{log.table_name}</td>
                              <td className="p-2 text-gray-400 max-w-xs truncate">
                                {JSON.stringify(log.details)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {logsSubTab === 'errors' && (
                  <div className="space-y-3 max-h-96 overflow-auto">
                    {systemErrors.length === 0 ? (
                      <p className="text-gray-400">No system errors logged.</p>
                    ) : (
                      systemErrors.map((err) => (
                        <div
                          key={err.id}
                          className="bg-red-900/20 border border-red-500/30 rounded-lg p-4"
                        >
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>{format(new Date(err.created_at), 'PPpp')}</span>
                            <span className="font-mono truncate">{err.url}</span>
                          </div>
                          <p className="text-red-400 font-mono text-sm mb-2">{err.error_message}</p>
                          {err.error_stack && (
                            <details className="mt-2">
                              <summary className="text-gray-400 text-xs cursor-pointer">
                                Stack trace
                              </summary>
                              <pre className="mt-1 text-xs text-red-300 overflow-auto max-h-40 p-2 bg-gray-900 rounded">
                                {err.error_stack}
                              </pre>
                            </details>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminPage;
