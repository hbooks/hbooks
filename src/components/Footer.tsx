import { Heart, Twitter, Instagram, Facebook, MessageCircle } from 'lucide-react';

const socialLinks = [
  { 
    label: 'X', 
    href: 'https://x.com/Raphael888870',
    icon: Twitter 
  },
  { 
    label: 'Instagram', 
    href: 'https://www.instagram.com/raphael_mmw/',
    icon: Instagram 
  },
  { 
    label: 'Facebook', 
    href: 'https://www.facebook.com/profile.php?id=61581325859715',
    icon: Facebook 
  },
  { 
    label: 'Discord', 
    href: 'https://discord.gg/zbaugS2B2',
    icon: MessageCircle 
  },
];

const Footer = () => (
  <footer className="bg-secondary text-secondary-foreground py-8">
    <div className="container mx-auto px-4 text-center">
      {/* Social Links */}
      <div className="flex justify-center gap-8 mb-6">
        {socialLinks.map(link => {
          const Icon = link.icon;
          return (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-primary-foreground transition-all duration-300 hover:scale-110"
              aria-label={link.label}
            >
              <Icon size={20} />
            </a>
          );
        })}
      </div>

      {/* Legal & Navigation Links */}
      <div className="flex justify-center gap-4 text-xs text-muted-foreground mb-2 flex-wrap">
        <a href="/privacy" className="hover:text-accent transition-colors">
          Privacy Policy
        </a>
        <span>|</span>
        <a href="/terms" className="hover:text-accent transition-colors">
          Terms of Service
        </a>
        <span>|</span>
        <a href="/faq" className="hover:text-accent transition-colors">
          FAQ
        </a>
        <span>|</span>
        <a href="/helpline" className="hover:text-accent transition-colors">
          Help
        </a>
        <span>|</span>
        <a
          href="https://exclusive.hpbooks.uk"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-accent transition-colors"
        >
          Buy Exclusive Scenes
        </a>
        <span>|</span>
        <a
          href="https://status.hpbooks.uk"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-accent transition-colors"
        >
          System Status
        </a>
      </div>

      {/* Copyright */}
      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
        Made with <Heart size={12} className="text-accent" /> for stories.
      </p>
      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
        © 2026 Hbooks / H00man Publisher. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
