import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const PostToDiscord = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [channel, setChannel] = useState('behind');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!user || user.email !== 'admin@hpbooks.uk') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <Card className="max-w-md w-full p-6">
          <CardHeader><CardTitle>Access Denied</CardTitle></CardHeader>
          <CardContent><p>You do not have permission to view this page.</p></CardContent>
        </Card>
      </div>
    );
  }

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
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      let imagePath = null;
      if (imageFile) imagePath = await uploadFile(imageFile, 'images');
      let audioPath = null;
      if (audioFile) audioPath = await uploadFile(audioFile, 'audio');

      const scheduled = scheduledDate ? new Date(scheduledDate).toISOString() : null;

      if (scheduled) {
        // Schedule post
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
        // Post immediately
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

        // Log post
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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary py-12 px-4">
      <div className="container max-w-2xl mx-auto">
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
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? <Loader2 className="animate-spin mr-2" /> : null}
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
