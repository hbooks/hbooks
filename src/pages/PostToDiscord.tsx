import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, LogOut, Eye, Trash2, Send, Calendar, Image as ImageIcon, Music } from 'lucide-react';
import { Session } from '@supabase/supabase-js';
import { format } from 'date-fns';

const channels = [
  { id: 'speaks', label: 'The Circle Speaks (votes/announcements)', icon: '🗳️' },
  { id: 'behind', label: 'Behind the Scenes', icon: '🎬' },
  { id: 'leaks', label: 'Chapter Leaks', icon: '📖' },
  { id: 'music', label: 'Mood and Music', icon: '🎵' },
];

const PostToDiscord = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['behind']);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [logsOpen, setLogsOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingAuth(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('discord_posts')
      .select('*')
      .order('posted_at', { ascending: false })
      .limit(20);
    setLogs(data || []);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError(error.message);
    else { setEmail(''); setPassword(''); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index: number) => {
    const newFiles = [...imageFiles];
    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAudioFile(e.target.files?.[0] || null);
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setSelectedChannels(['behind']);
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setImageFiles([]);
    setImagePreviews([]);
    setAudioFile(null);
    setScheduledDate('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || selectedChannels.length === 0) {
      setError('Title and at least one channel are required');
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const imagePaths = await Promise.all(
        imageFiles.map(async (file) => {
          const fileName = `${Date.now()}-${file.name}`;
          const { data, error } = await supabase.storage
            .from('discord_temp')
            .upload(`images/${fileName}`, file);
          if (error) throw new Error(`Image upload failed: ${error.message}`);
          return data.path;
        })
      );

      let audioPath = null;
      if (audioFile) {
        const fileName = `${Date.now()}-${audioFile.name}`;
        const { data, error } = await supabase.storage
          .from('discord_temp')
          .upload(`audio/${fileName}`, audioFile);
        if (error) throw new Error(`Audio upload failed: ${error.message}`);
        audioPath = data.path;
      }

      const token = session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/post-to-discord`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            content,
            image_paths: imagePaths,
            audio_path: audioPath,
            channels: selectedChannels,
          }),
        }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to post');

      setSuccess(true);
      resetForm();
      fetchLogs();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingAuth) return <div className="min-h-screen flex items-center justify-center bg-secondary"><Loader2 className="animate-spin text-accent" /></div>;
  if (!session) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
        <div className="bg-card max-w-md w-full p-8 rounded-lg shadow-xl">
          <h2 className="font-display text-2xl text-center mb-6">Admin Access</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2 rounded border border-border bg-background text-foreground" />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-2 rounded border border-border bg-background text-foreground" />
            <Button type="submit" variant="hero" className="w-full">Login</Button>
            {loginError && <p className="text-destructive text-sm text-center">{loginError}</p>}
          </form>
        </div>
      </div>
    );
  }
  if (session.user.email !== 'admin@hpbooks.uk') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
        <Card className="max-w-md w-full">
          <CardHeader><CardTitle>Access Denied</CardTitle></CardHeader>
          <CardContent>
            <p>You do not have permission to view this page.</p>
            <Button variant="hero" onClick={handleLogout} className="mt-4">Logout</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/assets/favicon/web-app-manifest-192x192.png" alt="Logo" className="w-10 h-10 rounded-full border-2 border-gold" />
            <div>
              <h1 className="font-display text-xl text-white">Discord Publisher</h1>
              <p className="text-xs text-gray-400">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-gray-700/50 px-3 py-1 rounded-full text-sm">
              <div className="relative">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-2 h-2 bg-red-500 rounded-full animate-ping opacity-75"></div>
              </div>
              <span className="text-gold font-semibold">LIVE</span>
              <span className="text-gray-300 font-mono">{format(currentTime, 'HH:mm:ss')}</span>
            </div>
            <Dialog open={logsOpen} onOpenChange={setLogsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={fetchLogs} className="border-gold/50 text-gold hover:bg-gold/10">
                  <Eye size={16} className="mr-1" /> Logs
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto bg-gray-800 border-gray-700">
                <DialogHeader><DialogTitle className="text-white">Recent Posts</DialogTitle></DialogHeader>
                <div className="space-y-2">
                  {logs.length === 0 ? (
                    <p className="text-gray-400">No posts yet.</p>
                  ) : (
                    logs.map(log => (
                      <div key={log.id} className="border-b border-gray-700 pb-2">
                        <div className="font-semibold text-white">{log.title}</div>
                        <div className="text-sm text-gray-400">{new Date(log.posted_at).toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Channels: {JSON.parse(log.channels || '[]').join(', ')}</div>
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-300 hover:text-white">
              <LogOut size={16} className="mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-gray-700 pb-4">
            <CardTitle className="text-3xl font-display text-gold">Create a Post</CardTitle>
            <p className="text-gray-400 text-sm mt-1">Send updates, images, or audio to your Discord channels</p>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <Label htmlFor="title" className="text-gray-300">Title <span className="text-red-400">*</span></Label>
                <Input
                  id="title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  placeholder="Enter a compelling title"
                  className="bg-gray-900 border-gray-600 text-white placeholder-gray-500 focus:ring-gold focus:border-gold"
                />
              </div>

              {/* Content */}
              <div>
                <Label htmlFor="content" className="text-gray-300">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={5}
                  placeholder="Write your announcement or description..."
                  className="bg-gray-900 border-gray-600 text-white placeholder-gray-500 focus:ring-gold focus:border-gold resize-none"
                />
              </div>

              {/* Channels */}
              <div>
                <Label className="text-gray-300">Channels <span className="text-red-400">*</span></Label>
                <div className="flex flex-wrap gap-4 mt-2">
                  {channels.map(ch => (
                    <div key={ch.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`ch-${ch.id}`}
                        checked={selectedChannels.includes(ch.id)}
                        onCheckedChange={(checked) => {
                          if (checked) setSelectedChannels(prev => [...prev, ch.id]);
                          else setSelectedChannels(prev => prev.filter(c => c !== ch.id));
                        }}
                        className="border-gray-500 data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                      />
                      <Label htmlFor={`ch-${ch.id}`} className="text-sm text-gray-300">{ch.icon} {ch.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div>
                <Label htmlFor="images" className="text-gray-300">Images (multiple)</Label>
                <div className="relative">
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="bg-gray-900 border-gray-600 text-white file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-gold file:text-black hover:file:bg-gold/80"
                  />
                </div>
                <div className="flex flex-wrap gap-3 mt-3">
                  {imagePreviews.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <img src={url} alt="preview" className="h-20 w-20 object-cover rounded-md border border-gray-600" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audio */}
              <div>
                <Label htmlFor="audio" className="text-gray-300">Audio (optional)</Label>
                <Input
                  id="audio"
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioChange}
                  className="bg-gray-900 border-gray-600 text-white file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-gold file:text-black hover:file:bg-gold/80"
                />
              </div>

              {/* Schedule */}
              <div>
                <Label htmlFor="schedule" className="text-gray-300">Schedule (optional)</Label>
                <Input
                  id="schedule"
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={e => setScheduledDate(e.target.value)}
                  className="bg-gray-900 border-gray-600 text-white"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to post immediately.</p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-gold text-black hover:bg-gold/90 transition-all duration-200 py-3 text-lg font-semibold"
              >
                {submitting ? <Loader2 className="animate-spin mr-2" /> : <Send size={18} className="mr-2" />}
                {scheduledDate ? 'Schedule Post' : 'Post to Discord'}
              </Button>

              {/* Messages */}
              {success && (
                <div className="bg-green-900/30 border border-green-600 text-green-400 rounded-md p-3 text-center">
                  ✓ Posted successfully!
                </div>
              )}
              {error && (
                <div className="bg-red-900/30 border border-red-600 text-red-400 rounded-md p-3 text-center">
                  ✗ {error}
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PostToDiscord;
