import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogOut } from 'lucide-react';
import { Session } from '@supabase/supabase-js';

const PostToDiscord = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [channel, setChannel] = useState('behind');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoginError(error.message);
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const uploadFile = async (file: File, folder: string) => {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('discord_temp')
      .upload(`${folder}/${fileName}`, file);
    if (error) throw new Error(`Upload failed: ${error.message}`);
    return data.path;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview('');
    }
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setAudioFile(file);
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setImageFile(null);
    setAudioFile(null);
    setImagePreview('');
    setScheduledDate('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      let imagePath = null;
      if (imageFile) imagePath = await uploadFile(imageFile, 'images');
      let audioPath = null;
      if (audioFile) audioPath = await uploadFile(audioFile, 'audio');

      const scheduled = scheduledDate ? new Date(scheduledDate).toISOString() : null;

      if (scheduled) {
        const { error: insertError } = await supabase.from('discord_posts').insert({
          title,
          content,
          image_path: imagePath,
          audio_path: audioPath,
          channel,
          scheduled_for: scheduled,
        });
        if (insertError) throw new Error(insertError.message);
        setSuccess(true);
        resetForm();
      } else {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/post-to-discord`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title,
              content,
              image_path: imagePath,
              audio_path: audioPath,
              channel,
            }),
          }
        );
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Failed to post');

        await supabase.from('discord_posts').insert({
          title,
          content,
          image_path: imagePath,
          audio_path: audioPath,
          channel,
          posted_at: new Date().toISOString(),
        });

        setSuccess(true);
        resetForm();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <Loader2 className="animate-spin text-accent" />
      </div>
    );
  }

  // Not logged in – show login form
  if (!session) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
        <div className="bg-card max-w-md w-full p-8 rounded-lg shadow-xl">
          <h2 className="font-display text-2xl text-center mb-6">Admin Access</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded border border-border bg-background text-foreground"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded border border-border bg-background text-foreground"
            />
            <Button type="submit" variant="hero" className="w-full">Login</Button>
            {loginError && <p className="text-destructive text-sm text-center">{loginError}</p>}
          </form>
        </div>
      </div>
    );
  }

  // Logged in but not admin email
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

  // Admin logged in – show posting form
  return (
    <div className="min-h-screen bg-secondary py-12 px-4">
      <div className="container max-w-2xl mx-auto">
        <div className="flex justify-end mb-4">
          <Button variant="ghost" onClick={handleLogout} className="text-muted-foreground">
            <LogOut size={16} className="mr-2" /> Logout
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-display">Post to Discord</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Enter title"
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  placeholder="Write the announcement or description..."
                />
              </div>
              <div>
                <Label htmlFor="channel">Channel</Label>
                <Select value={channel} onValueChange={setChannel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="speaks">The Circle Speaks (votes/announcements)</SelectItem>
                    <SelectItem value="behind">Behind the Scenes</SelectItem>
                    <SelectItem value="leaks">Chapter Leaks</SelectItem>
                    <SelectItem value="music">Mood and Music</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="image">Image (optional)</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="mt-2 max-h-48 rounded border border-accent/20" />
                )}
              </div>
              {channel === 'music' && (
                <div>
                  <Label htmlFor="audio">Audio File (optional)</Label>
                  <Input
                    id="audio"
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioChange}
                  />
                </div>
              )}
              <div>
                <Label htmlFor="schedule">Schedule (optional)</Label>
                <Input
                  id="schedule"
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">Leave empty to post immediately.</p>
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? <Loader2 className="animate-spin mr-2" /> : null}
                {scheduledDate ? 'Schedule Post' : 'Post to Discord'}
              </Button>
              {success && <p className="text-green-600 text-center">Posted successfully!</p>}
              {error && <p className="text-red-500 text-center">{error}</p>}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostToDiscord;
