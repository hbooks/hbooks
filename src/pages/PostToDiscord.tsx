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
import { Loader2, LogOut, Eye, Trash2 } from 'lucide-react';
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
    <div className="min-h-screen bg-secondary text-secondary-foreground">
      {/* Simple header with live indicator */}
      <header className="bg-card border-b border-border py-4 px-6 sticky top-0 z-20">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/assets/favicon/web-app-manifest-192x192.png"
              alt="Logo"
              className="w-8 h-8 rounded-full border border-accent"
            />
            <h1 className="font-display text-xl text-cream">Discord Publisher</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="relative">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-2 h-2 bg-red-500 rounded-full animate-ping opacity-75"></div>
              </div>
              <span className="text-accent font-semibold">LIVE</span>
              <span className="text-muted-foreground font-mono">{format(currentTime, 'HH:mm:ss')}</span>
            </div>
            <Dialog open={logsOpen} onOpenChange={setLogsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={fetchLogs} className="border-border text-muted-foreground hover:text-accent">
                  <Eye size={16} className="mr-1" /> Logs
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
                <DialogHeader><DialogTitle>Recent Posts</DialogTitle></DialogHeader>
                <div className="space-y-2">
                  {logs.length === 0 ? (
                    <p className="text-muted-foreground">No posts yet.</p>
                  ) : (
                    logs.map(log => (
                      <div key={log.id} className="border-b border-border pb-2">
                        <div className="font-semibold">{log.title}</div>
                        <div className="text-sm text-muted-foreground">{new Date(log.posted_at).toLocaleString()}</div>
                        <div className="text-xs">Channels: {JSON.parse(log.channels || '[]').join(', ')}</div>
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-accent">
              <LogOut size={16} className="mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="bg-card border-border shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-display text-cream">Create a Post</CardTitle>
            <p className="text-muted-foreground text-sm">Send updates, images, or audio to your Discord channels</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-foreground">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  placeholder="Enter title"
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div>
                <Label htmlFor="content" className="text-foreground">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={5}
                  placeholder="Write your announcement or description..."
                  className="bg-background border-border text-foreground resize-none"
                />
              </div>
              <div>
                <Label className="text-foreground">Channels (select at least one)</Label>
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
                        className="border-border"
                      />
                      <Label htmlFor={`ch-${ch.id}`} className="text-sm text-foreground">{ch.icon} {ch.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="images" className="text-foreground">Images (multiple)</Label>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="bg-background border-border text-foreground"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {imagePreviews.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <img src={url} alt="preview" className="h-16 w-auto rounded border border-accent/30" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="audio" className="text-foreground">Audio (optional)</Label>
                <Input
                  id="audio"
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioChange}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div>
                <Label htmlFor="schedule" className="text-foreground">Schedule (optional)</Label>
                <Input
                  id="schedule"
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={e => setScheduledDate(e.target.value)}
                  className="bg-background border-border text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">Leave empty to post immediately.</p>
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {submitting ? <Loader2 className="animate-spin mr-2" /> : null}
                {scheduledDate ? 'Schedule Post' : 'Post to Discord'}
              </Button>
              {success && <p className="text-green-600 text-center">Posted successfully!</p>}
              {error && <p className="text-red-500 text-center">{error}</p>}
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PostToDiscord;
