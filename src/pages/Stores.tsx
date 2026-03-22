import { Link } from 'react-router-dom';
import { BookOpen, ExternalLink, Mail, Shield, AlertCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Stores = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 py-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-full bg-accent mx-auto mb-6 flex items-center justify-center">
            <BookOpen size={36} className="text-accent-foreground" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-cream mb-4">Where to Find My Books</h1>
          <p className="text-muted-foreground text-lg">
            All my books are distributed through trusted partners to bring them to your favourite stores.
          </p>
        </div>

        <div className="space-y-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-display text-2xl text-accent mb-3">Our Partner: Draft2Digital</h2>
            <p className="text-muted-foreground mb-4">
              I’ve partnered with <strong>Draft2Digital</strong> – a trusted global distributor – to make my books available at Amazon, Apple Books, Kobo, Barnes & Noble, and many more. This ensures you can shop at your preferred store, in your region, with the format you love.
            </p>
            <p className="text-muted-foreground">
              When you click “Get the Book” on any book page, you’re taken to a secure Books2Read page powered by Draft2Digital. There, you can choose your favourite retailer and complete your purchase safely.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-display text-2xl text-accent mb-3">Your Privacy & Security</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Lock size={18} className="text-accent flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground text-sm">
                  <strong>We never collect or store your payment information.</strong> All purchases are handled directly by Draft2Digital and the retailer you choose. Your financial data never touches our servers.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Shield size={18} className="text-accent flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground text-sm">
                  <strong>No personal data is stored on this site when you buy a book.</strong> We only keep the email address you voluntarily provide if you sign up for our newsletter or contact us.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-accent flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground text-sm">
                  <strong>Our own shop is under development</strong> – once it launches, it will use the same secure, privacy‑focused approach. Your trust matters.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-display text-2xl text-accent mb-3">Our Own Shop – Coming Soon</h2>
            <p className="text-muted-foreground mb-4">
              I’m currently building a dedicated shop right here on this site. The shop will offer exclusive content, signed editions, and direct purchasing options – all with the same care and attention you’ve come to expect.
            </p>
            <div className="flex items-start gap-3 bg-accent/10 p-4 rounded-lg border border-accent/30">
              <AlertCircle size={20} className="text-accent flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                While the shop is under development, all books are available through our partner retailers. Stay tuned for updates – I’ll announce the launch right here.
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-display text-2xl text-accent mb-3">Still Have Questions?</h2>
            <p className="text-muted-foreground mb-4">
              If you need help finding a book, have a question about distribution, or just want to say hello, I’d love to hear from you.
            </p>
            <a
              href="mailto:inquiries@hpbooks.uk"
              className="inline-flex items-center gap-2 text-accent hover:underline"
            >
              <Mail size={18} />
              inquiries@hpbooks.uk
            </a>
          </div>
        </div>

        <div className="text-center mt-12">
          <Button variant="heroOutline" asChild>
            <Link to="/library">
              <BookOpen size={18} className="mr-2" />
              Back to Library
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
};

export default Stores;
