import { useState } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

const socialLinks = [
  { label: '𝕏', href: 'https://x.com/Raphael888870' },
  { label: 'Instagram', href: 'https://www.instagram.com/raphael_mmw/' },
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61581325859715' },
  { label: 'Discord', href: 'https://discord.gg/zbaugS2B2' },
];

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitting(true);
    setError('');

    // 1. Insert into Supabase
    const { error: insertError } = await supabase.from('contact_messages').insert({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    });

    if (insertError) {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
      return;
    }

    // 2. Call Edge Function to send auto‑reply email
    try {
      const response = await fetch(
        'https://xwomtgvefbshvzgddnig.supabase.co/functions/v1/send-autoreply',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
          }),
        }
      );
      if (!response.ok) {
        console.error('Auto‑reply failed:', await response.text());
      }
    } catch (notifyErr) {
      console.error('Auto‑reply error:', notifyErr);
    }

    // 3. Clear form and show success
    setSubmitting(false);
    setSuccess(true);
    setName('');
    setEmail('');
    setMessage('');
    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <main className="min-h-screen bg-secondary text-secondary-foreground py-16 px-4">
      <div className="container mx-auto max-w-xl">
        <div className="text-center mb-12">
          <MessageCircle size={48} className="mx-auto text-accent mb-4" />
          <h1 className="font-display text-4xl md:text-5xl mb-4 text-cream">Get in Touch</h1>
          <p className="text-cream opacity-80">
            For comments, inquiries, or just to say hello:
          </p>
          <p className="text-accent font-semibold mt-2">commentsinquiries@gmail.com</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card text-card-foreground p-8 rounded-lg shadow-md space-y-4">
          <h2 className="font-display text-xl mb-4 text-center">Send a Message</h2>
          <div>
            <label className="block text-sm font-semibold mb-1">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              maxLength={100}
              className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Your Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              maxLength={255}
              className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Message</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
              maxLength={1000}
              rows={5}
              className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
            />
          </div>
          <Button type="submit" disabled={submitting} variant="hero" className="w-full">
            <Send size={16} /> {submitting ? 'Sending...' : 'Send Message'}
          </Button>
          {success && <p className="text-center text-sm text-accent font-medium">Message sent! Thank you for reaching out.</p>}
          {error && <p className="text-center text-sm text-destructive font-medium">{error}</p>}
        </form>

        <div className="mt-10 text-center">
          <p className="text-cream opacity-60 text-sm mb-4">Or find me on social media</p>
          <div className="flex justify-center gap-6">
            {socialLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-cream transition-all duration-300 hover:scale-110 font-semibold"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Contact;
