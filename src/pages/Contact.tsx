import { useState } from 'react';
import { Send } from 'lucide-react';
import { FaXTwitter, FaInstagram, FaFacebookF, FaDiscord } from 'react-icons/fa6';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

const socialLinks = [
  { label: 'X', icon: FaXTwitter, href: 'https://x.com/Raphael888870', color: '#000000' },
  { label: 'Instagram', icon: FaInstagram, href: 'https://www.instagram.com/raphael_mmw/', color: '#E4405F' },
  { label: 'Facebook', icon: FaFacebookF, href: 'https://www.facebook.com/profile.php?id=61581325859715', color: '#1877F2' },
  { label: 'Discord', icon: FaDiscord, href: 'https://discord.gg/zbaugS2B2', color: '#5865F2' },
];

const Contact = () => {
  const [showForm, setShowForm] = useState(false);
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

    // Auto‑reply email (unchanged)
    try {
      await fetch(
        'https://xwomtgvefbshvzgddnig.supabase.co/functions/v1/send-autoreply',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), email: email.trim() }),
        }
      );
    } catch (notifyErr) {
      console.error('Auto‑reply error:', notifyErr);
    }

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
          <h1 className="font-display text-4xl md:text-5xl mb-4 text-cream">Let's Connect</h1>
          <p className="text-cream opacity-80">
            For comments, inquiries, or just to say hello:
          </p>
          <p className="text-accent font-semibold mt-2">inquiries@hpbooks.uk</p>
        </div>

        {/* Social Icons – large & colourful */}
        <div className="mb-16 text-center">
          <p className="text-cream opacity-60 text-sm mb-6">Follow me on</p>
          <div className="flex justify-center gap-8">
            {socialLinks.map(({ label, icon: Icon, href, color }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="transform transition-all duration-300 hover:scale-110"
                style={{ color }}
              >
                <Icon size={40} />
              </a>
            ))}
          </div>
        </div>

        {/* Button that reveals the form */}
        {!showForm ? (
          <div className="text-center">
            <Button
              variant="hero"
              size="lg"
              onClick={() => setShowForm(true)}
              className="px-10 py-6 text-lg"
            >
              <Send size={20} className="mr-2" />
              Message me
            </Button>
          </div>
        ) : (
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
              <Send size={16} className="mr-2" />
              {submitting ? 'Sending...' : 'Send Message'}
            </Button>
            {success && <p className="text-center text-sm text-accent font-medium">Message sent! Thank you for reaching out.</p>}
            {error && <p className="text-center text-sm text-destructive font-medium">{error}</p>}
          </form>
        )}
      </div>
    </main>
  );
};

export default Contact;
