import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogIn, X as CloseIcon } from 'lucide-react';
import { FaBook, FaPaypal } from 'react-icons/fa';
import { SiKofi } from 'react-icons/si';

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/books', label: 'Latest Book' },
  { to: '/news', label: 'News' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/library', label: 'Library' },
  { to: '/contact', label: 'Contact' },
  { to: '/support', label: 'Support Me' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [supportTextIndex, setSupportTextIndex] = useState(0);
  const location = useLocation();

  const supportOptions = [
    { text: 'Support me on', icon: null },
    { text: 'Buy me a coffee', icon: FaBook },
    { text: 'Ko-fi', icon: SiKofi },
    { text: 'PayPal', icon: FaPaypal },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSupportTextIndex((prev) => (prev + 1) % supportOptions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentSupport = supportOptions[supportTextIndex];
  const SupportIcon = currentSupport.icon;

  return (
    <>
      <nav className="nav-highlight">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          {/* Logo with image */}
          <Link to="/" className="flex items-center gap-2 z-10">
            <img
              src="/assets/favicon/web-app-manifest-192x192.png"
              alt="Hbooks"
              className="w-8 h-8 rounded-full border border-accent/30"
            />
            <span className="font-display text-2xl font-bold tracking-widest text-accent select-none">
              hpbooks
            </span>
          </Link>

          {/* Desktop Navigation – uses anchor positioning */}
          <ul className="hidden md:flex items-center gap-6">
            {links.map(link => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`text-sm font-medium transition-colors hover:text-accent ${
                    location.pathname === link.to ? 'text-accent' : 'text-secondary-foreground'
                  }`}
                >
                  {link.label === 'Support Me' ? (
                    <span className="flex items-center gap-2 transition-all duration-300">
                      {SupportIcon && <SupportIcon className="text-accent" size={16} />}
                      {currentSupport.text}
                    </span>
                  ) : (
                    link.label
                  )}
                </Link>
              </li>
            ))}
            {/* Login Button (desktop) – separate, not part of anchor effect */}
            <li>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-2 bg-accent text-accent-foreground hover:bg-accent/90 px-4 py-2 rounded-md font-medium transition-colors"
              >
                <LogIn size={18} />
                <span>Log in</span>
              </button>
            </li>
          </ul>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden z-10">
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="bg-accent text-accent-foreground p-2 rounded-md"
              aria-label="Log in"
            >
              <LogIn size={20} />
            </button>
            <button
              className="text-secondary-foreground"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation Dropdown */}
          <ul
            className={`${
              isOpen ? 'flex' : 'hidden'
            } md:hidden absolute top-full left-0 w-full bg-secondary flex-col gap-0 px-4 pb-4 shadow-lg z-50`}
          >
            {links.map(link => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`block py-2 text-sm font-medium transition-colors hover:text-accent ${
                    location.pathname === link.to ? 'text-accent' : 'text-secondary-foreground'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label === 'Support Me' ? (
                    <span className="flex items-center gap-2">
                      {SupportIcon && <SupportIcon className="text-accent" size={16} />}
                      {currentSupport.text}
                    </span>
                  ) : (
                    link.label
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* CSS for anchor positioning effect – scoped to .nav-highlight */}
      <style>{`
        .nav-highlight {
          position: sticky;
          top: 0;
          z-index: 50;
          background-color: rgba(18, 18, 18, 0.8);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(184, 162, 122, 0.2);
        }

        .nav-highlight > .container {
          position: relative;
        }

        .nav-highlight ul {
          position: relative;
          margin: 0;
          padding: 0;
          list-style: none;
          display: flex;
          gap: 1.5rem;
        }

        /* Anchor positioning setup */
        .nav-highlight ul:has(:not(:hover)) {
          anchor-name: --test;
        }

        .nav-highlight a {
          display: inline-block;
          padding: 0.5rem 0;
          text-decoration: none;
          color: inherit;
        }

        .nav-highlight a:hover {
          anchor-name: --test;
        }

        /* The sliding indicator (pseudo-element) */
        .nav-highlight ul::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: anchor(left);
          right: anchor(right);
          height: 2px;
          background: var(--accent, #B8A27A);
          transition: 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.1);
          position-anchor: --test;
          visibility: hidden;
        }

        .nav-highlight ul:has(a:hover)::after {
          visibility: visible;
        }

        /* Fallback for browsers that don't support anchor positioning */
        @supports not (anchor-name: --test) {
          .nav-highlight a {
            position: relative;
          }
          .nav-highlight a::after {
            content: '';
            position: absolute;
            bottom: -4px;
            left: 0;
            width: 0;
            height: 2px;
            background: var(--accent, #B8A27A);
            transition: width 0.2s ease;
          }
          .nav-highlight a:hover::after,
          .nav-highlight a.active::after {
            width: 100%;
          }
          .nav-highlight ul::after {
            display: none;
          }
        }
      `}</style>

      {/* Login Modal (unchanged) */}
      {isLoginModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsLoginModalOpen(false)}
        >
          <div
            className="bg-card max-w-md w-full rounded-2xl shadow-2xl border border-accent/20 p-8 relative animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-accent transition-colors"
            >
              <CloseIcon size={20} />
            </button>

            <div className="text-center">
              <div className="w-20 h-20 bg-accent/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                <LogIn size={36} className="text-accent" />
              </div>
              <h2 className="font-display text-3xl text-foreground mb-3">Coming Soon</h2>
              <p className="text-muted-foreground mb-6">
                The Inner Circle login is under construction. While we build this space, your support helps bring it to life faster.
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                Every contribution fuels development, exclusive content, and a better experience for everyone.
              </p>
              <a
                href="/support"
                className="inline-block bg-accent hover:bg-accent/90 text-accent-foreground font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                onClick={() => setIsLoginModalOpen(false)}
              >
                Support the Project
              </a>
              <p className="text-xs text-muted-foreground mt-6">
                Thank you for being part of the journey ❤️
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
