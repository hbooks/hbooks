import { useState } from 'react';
import { Heart, Coffee, CreditCard, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Support = () => {
  const [popupOpen, setPopupOpen] = useState(false);

  const openPopup = (url: string) => {
    setPopupOpen(true);
    const width = 700;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      url,
      'support-popup',
      `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes,toolbar=no,location=no,menubar=no`
    );

    if (!popup) {
      alert('Popup blocked. Please allow popups for this site or try again.');
      setPopupOpen(false);
      return;
    }

    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        setPopupOpen(false);
      }
    }, 500);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 py-16 px-4 relative">
      {/* Background image overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 z-0"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?q=80&w=2070&auto=format)' }}
      />
      <div className="relative z-10 container mx-auto max-w-3xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-accent rounded-full shadow-lg shadow-accent/20 mb-6">
            <Heart size={56} className="text-white" />
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-white mb-4">
            Support My Work
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            If you enjoy my writing and want to help me create more stories, you can support me through any of the options below. Every little bit fuels the imagination and keeps the stories coming.
          </p>
        </div>

        {/* Support Options Grid */}
        <div className="grid gap-8 md:grid-cols-3 mb-16">
          {/* Buy Me a Coffee */}
          <div
            onClick={() => openPopup('https://buymeacoffee.com/h00man')}
            className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group border border-white/20"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-accent/20 p-4 rounded-full mb-4 group-hover:bg-accent/30 transition-colors">
                <Coffee size={40} className="text-accent" />
              </div>
              <h3 className="font-display text-2xl text-white mb-2">Buy Me a Book</h3>
              <p className="text-gray-300 text-sm mb-4">Support via Buy Me a Coffee</p>
              <span className="text-accent font-medium inline-flex items-center gap-1">
                Open <ExternalLink size={16} />
              </span>
            </div>
          </div>

          {/* Ko-fi */}
          <div
            onClick={() => openPopup('https://ko-fi.com/N4N21UWMCF')}
            className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group border border-white/20"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-accent/20 p-4 rounded-full mb-4 group-hover:bg-accent/30 transition-colors">
                <Heart size={40} className="text-accent" />
              </div>
              <h3 className="font-display text-2xl text-white mb-2">Ko‑fi</h3>
              <p className="text-gray-300 text-sm mb-4">Support my work on Ko‑fi</p>
              <span className="text-accent font-medium inline-flex items-center gap-1">
                Open <ExternalLink size={16} />
              </span>
            </div>
          </div>

          {/* PayPal */}
          <div
            onClick={() => openPopup('https://www.paypal.com/donate/?hosted_button_id=RM4YFU4BF45WG')}
            className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group border border-white/20"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-accent/20 p-4 rounded-full mb-4 group-hover:bg-accent/30 transition-colors">
                <CreditCard size={40} className="text-accent" />
              </div>
              <h3 className="font-display text-2xl text-white mb-2">PayPal</h3>
              <p className="text-gray-300 text-sm mb-4">Donate via PayPal</p>
              <span className="text-accent font-medium inline-flex items-center gap-1">
                Open <ExternalLink size={16} />
              </span>
            </div>
          </div>
        </div>

        {/* Discord Community Card */}
        <div className="bg-accent/20 backdrop-blur-sm text-white rounded-3xl shadow-2xl p-10 text-center border border-accent/30">
          <h2 className="font-display text-3xl mb-4">Join the Inner Circle on Discord</h2>
          <p className="text-lg mb-6 opacity-90">
            Get exclusive updates, early peeks, and connect with fellow readers.
          </p>
          <a
            href="https://discord.gg/zbaugS2B2"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-accent text-black hover:bg-accent/90 font-bold px-8 py-4 rounded-full text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Join Discord <ExternalLink size={20} />
          </a>
        </div>
      </div>
    </main>
  );
};

export default Support;
