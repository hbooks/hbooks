import { useState } from 'react';
import { Send, X } from 'lucide-react';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setName('');
    setEmail('');
    setMessage('');
    setSuccess(false);
    setError('');
  };

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
    resetForm();

    // Close modal after 2 seconds
    setTimeout(() => {
      setIsModalOpen(false);
      setSuccess(false);
    }, 2000);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
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

        {/* Button that opens the modal */}
        <div className="text-center">
          <Button
            variant="hero"
            size="lg"
            onClick={() => setIsModalOpen(true)}
            className="px-10 py-6 text-lg"
          >
            <Send size={20} className="mr-2" />
            Message me
          </Button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-card max-w-md w-full rounded-2xl shadow-2xl border border-accent/20 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-muted-foreground hover:text-accent transition-colors"
            >
              <X size={20} />
            </button>

            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <h2 className="font-display text-xl text-center text-foreground">Send a Message</h2>
              <div>                
                <label className="block text-sm font-semibold text-black mb-1">Your Name</label>
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
                <label className="block text-sm font-semibold text-black mb-1">Your Email</label>
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
                <label className="block text-sm font-semibold text-black mb-1">Message</label>
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
              {success && (
                <p className="text-center text-sm text-accent font-medium">
                  Message sent! Thank you for reaching out.
                </p>
              )}
              {error && (
                <p className="text-center text-sm text-destructive font-medium">{error}</p>
              )}
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Contact;
