import { Heart } from 'lucide-react';

const socialLinks = [
  { label: '𝕏', href: 'https://x.com/Raphael888870' },
  { label: 'Instagram', href: 'https://www.instagram.com/raphael_mmw/' },
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61581325859715' },
  { label: 'Discord', href: 'https://discord.gg/zbaugS2B2' },
];

const Footer = () => (
  <footer className="bg-secondary text-secondary-foreground py-8">
    <div className="container mx-auto px-4 text-center">
      <div className="flex justify-center gap-8 mb-6">
        {socialLinks.map(link => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-primary-foreground transition-all duration-300 hover:scale-110 text-sm font-semibold tracking-wide"
          >
            {link.label}
          </a>
        ))}
      </div>
      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
        © 2026 hb00ks / H00man Publisher. All rights reserved. Made with <Heart size={12} className="text-accent" /> for stories.
      </p>
    </div>
  </footer>
);

export default Footer;
