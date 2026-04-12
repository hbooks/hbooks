import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, X as CloseIcon } from 'lucide-react';
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
  const [supportTextIndex, setSupportTextIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
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

  // Auto‑hide on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY < 100) {
        setVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const currentSupport = supportOptions[supportTextIndex];
  const SupportIcon = currentSupport.icon;

  const goToShop = () => {
    window.location.href = 'https://bookshop.hpbooks.uk';
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300 ${
          visible ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{ background: 'transparent', backdropFilter: 'none' }}
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          {/* Logo with image */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/assets/favicon/web-app-manifest-192x192.png"
              alt="Hbooks"
              className="w-8 h-8 rounded-full border border-accent/30"
            />
            <span className="font-display text-2xl font-bold tracking-widest text-accent select-none">
              hpbooks
            </span>
          </Link>

          {/* Desktop Navigation – with CSS anchor positioning */}
          <ul className="hidden md:flex items-center gap-6 relative nav-links">
            {links.map(link => (
              <li key={link.to} className="nav-item">
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
            {/* Shop Button */}
            <li>
              <button
                onClick={goToShop}
                className="flex items-center gap-2 bg-accent text-accent-foreground hover:bg-accent/90 px-4 py-2 rounded-md font-medium transition-colors"
              >
                <ShoppingBag size={18} />
                <span>Shop</span>
              </button>
            </li>
          </ul>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={goToShop}
              className="bg-accent text-accent-foreground p-2 rounded-md"
              aria-label="Shop"
            >
              <ShoppingBag size={20} />
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

      {/* CSS for anchor positioning effect (unchanged) */}
      <style>{`
        .nav-links {
          position: relative;
        }
        .nav-links::before {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--accent, #B8A27A);
          transition: width 0.3s ease;
        }
        .nav-links .nav-item {
          position: relative;
        }
        .nav-links .nav-item a {
          display: inline-block;
          padding: 0.25rem 0;
        }
        .nav-links .nav-item:first-child {
          anchor-name: --first;
        }
        .nav-links .nav-item:last-child {
          anchor-name: --last;
        }
        .nav-links::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: anchor(left);
          right: anchor(right);
          width: auto;
          height: 2px;
          background: var(--accent, #B8A27A);
          transition: left 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.1), right 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.1);
          position-anchor: --active;
          visibility: hidden;
        }
        .nav-links .nav-item:hover {
          anchor-name: --active;
        }
        .nav-links .nav-item:hover ~ .nav-links::after,
        .nav-links .nav-item:has(:hover) + .nav-links::after {
          visibility: visible;
        }
        .nav-links:has(:not(:hover))::after {
          anchor-name: --first;
          visibility: hidden;
        }
        @media (max-width: 768px) {
          .nav-links::after {
            display: none;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;
