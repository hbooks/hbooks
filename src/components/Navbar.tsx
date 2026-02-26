import { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  onAdminTrigger: () => void;
}

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/books', label: 'Books' },
  { to: '/news', label: 'News' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/library', label: 'Library' },
  { to: '/contact', label: 'Contact' },
  { to: '/support', label: 'Support' },
];

const Navbar = ({ onAdminTrigger }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const clickCount = useRef(0);
  const clickTimer = useRef<ReturnType<typeof setTimeout>>();
  const location = useLocation();

  const handleLogoClick = () => {
    clickCount.current++;
    if (clickCount.current >= 3) {
      clickCount.current = 0;
      clearTimeout(clickTimer.current);
      onAdminTrigger();
    } else {
      clearTimeout(clickTimer.current);
      clickTimer.current = setTimeout(() => {
        clickCount.current = 0;
      }, 600);
    }
  };

  return (
    <nav className="bg-secondary sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <button
          onClick={handleLogoClick}
          className="font-display text-2xl font-bold tracking-widest text-accent select-none"
        >
          hb00ks
        </button>

        <button
          className="md:hidden text-secondary-foreground"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <ul className={`${isOpen ? 'flex' : 'hidden'} md:flex absolute md:relative top-full left-0 w-full md:w-auto bg-secondary md:bg-transparent flex-col md:flex-row gap-0 md:gap-6 px-4 pb-4 md:p-0 z-50`}>
          {links.map(link => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`block py-2 md:py-0 text-sm font-medium transition-colors hover:text-accent ${
                  location.pathname === link.to ? 'text-accent' : 'text-secondary-foreground'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
