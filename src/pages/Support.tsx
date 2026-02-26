import { Heart, Coffee, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Support = () => (
  <main className="min-h-screen py-16 px-4">
    <div className="container mx-auto max-w-2xl text-center">
      <Heart size={48} className="mx-auto text-accent mb-6" />
      <h1 className="font-display text-4xl md:text-5xl mb-6">Support My Work</h1>
      <p className="text-lg leading-relaxed mb-10 text-muted-foreground">
        If you enjoy my writing and want to help me create more stories, you can support me through any of the options below. Every little bit fuels the imagination.
      </p>

      <div className="grid gap-6 sm:grid-cols-3 mb-12">
        <a
          href="https://buymeacoffee.com/h00man"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-card p-6 rounded-lg shadow-md border border-border hover:shadow-lg transition-shadow group"
        >
          <Coffee size={32} className="mx-auto text-accent mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-display text-lg mb-2">Buy Me a Book</h3>
          <p className="text-sm text-muted-foreground">Support via Buy Me a Coffee</p>
        </a>

        <a
          href="https://ko-fi.com/N4N21UWMCF"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-card p-6 rounded-lg shadow-md border border-border hover:shadow-lg transition-shadow group"
        >
          <Heart size={32} className="mx-auto text-accent mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-display text-lg mb-2">Ko-fi</h3>
          <p className="text-sm text-muted-foreground">Support my work on Ko-fi</p>
        </a>

        <a
          href="https://www.paypal.com/donate/?hosted_button_id=RM4YFU4BF45WG"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-card p-6 rounded-lg shadow-md border border-border hover:shadow-lg transition-shadow group"
        >
          <CreditCard size={32} className="mx-auto text-accent mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-display text-lg mb-2">PayPal</h3>
          <p className="text-sm text-muted-foreground">Donate via PayPal</p>
        </a>
      </div>

      <div className="bg-secondary text-secondary-foreground p-8 rounded-lg">
        <p className="mb-4">
          Join the <a href="https://discord.gg/zbaugS2B2" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-semibold">Discord</a> for exclusive updates and early peeks at upcoming work.
        </p>
      </div>
    </div>
  </main>
);

export default Support;
