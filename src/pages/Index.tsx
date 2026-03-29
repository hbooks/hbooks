import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import bookCover from '@/assets/gilded-cage-cover.png';
import { Heart } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// Optional Lenis smooth scroll (if installed)
let Lenis: any;
if (typeof window !== 'undefined') {
  import('lenis').then((module) => {
    Lenis = module.default;
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  });
}

interface NewsPost {
  id: number;
  title: string;
  date: string;
  content: string;
}

const Index = () => {
  const [latestNews, setLatestNews] = useState<NewsPost | null>(null);
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);
  const heroBookRef = useRef<HTMLDivElement>(null);

  // Fetch latest news from Supabase
  useEffect(() => {
    const fetchNews = async () => {
      const { data, error } = await supabase
        .from('news_posts')
        .select('id, title, date, content')
        .eq('published', true)
        .order('date', { ascending: false })
        .limit(1)
        .single();
      if (!error && data) setLatestNews(data);
    };
    fetchNews();

    const subscription = supabase
      .channel('public:news_posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'news_posts' }, fetchNews)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Parallax scroll effect: scale background images on scroll, with will-change for performance
  useEffect(() => {
    sectionsRef.current.forEach((section) => {
      if (!section) return;
      const bg = section.querySelector('.section-bg') as HTMLElement;
      if (!bg) return;

      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
        onUpdate: (self) => {
          const scale = 1 + self.progress * 0.4; // less extreme zoom (max 1.4)
          gsap.to(bg, { scale, duration: 0.1, ease: 'none' });
        },
      });
    });

    // Gentle floating animation for the book cover in hero (optional)
    if (heroBookRef.current) {
      gsap.to(heroBookRef.current, {
        y: 20,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="bg-black">
      {/* Hero section – book cover as a floating element */}
      <div
        ref={(el) => (sectionsRef.current[0] = el)}
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        <div
          className="section-bg absolute inset-0 z-0 bg-cover bg-center transition-transform duration-300 will-change-transform"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1887&auto=format)',
            filter: 'brightness(0.3)',
          }}
        />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 px-4 max-w-6xl mx-auto">
          <div className="flex-1 text-center md:text-left">
            <h1 className="font-display text-5xl md:text-7xl text-cream gold-glow mb-4">
              The Gilded Cage
            </h1>
            <p className="text-xl italic text-accent mb-2">Lovely Strangers, Book 1</p>
            <p className="text-lg text-cream/80 mb-8">Romance with a twist of mystery.</p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Button variant="hero" size="lg" asChild>
                <Link to="/books">Learn More</Link>
              </Button>
              <Button variant="heroOutline" size="lg" asChild>
                <a href="https://books2read.com/u/mgQwZK" target="_blank" rel="noopener noreferrer">
                  Buy the Book
                </a>
              </Button>
            </div>
          </div>
          <div ref={heroBookRef} className="flex-shrink-0 w-48 md:w-64">
            <img
              src={bookCover}
              alt="The Gilded Cage"
              className="w-full rounded-2xl shadow-2xl border-2 border-accent/30"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Story intro */}
      <div
        ref={(el) => (sectionsRef.current[1] = el)}
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        <div
          className="section-bg absolute inset-0 z-0 bg-cover bg-center transition-transform duration-300 will-change-transform"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2070&auto=format)',
            filter: 'brightness(0.35)',
          }}
        />
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl text-accent mb-6">A Story of Strangers</h2>
          <p className="text-cream/90 text-lg leading-relaxed">
            Remy Sot thought he knew the people closest to him. But when graduation brings rejection instead of romance,
            he's forced to confront a lifetime of emotional miscalculation – and the loneliness he's carried since childhood.
            Set against the simmering tension between two rival counties, this is a story about friendship, betrayal, and the
            strangers we become to the ones who raised us.
          </p>
        </div>
      </div>

      {/* Section 3: Latest News (dynamic) */}
      <div
        ref={(el) => (sectionsRef.current[2] = el)}
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        <div
          className="section-bg absolute inset-0 z-0 bg-cover bg-center transition-transform duration-300 will-change-transform"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format)',
            filter: 'brightness(0.35)',
          }}
        />
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl text-accent mb-8">Latest from the Desk</h2>
          {latestNews ? (
            <div className="bg-black/60 backdrop-blur-sm p-6 rounded-xl border border-accent/30">
              <h3 className="font-display text-2xl text-cream mb-2">{latestNews.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {new Date(latestNews.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-cream/80 leading-relaxed">{latestNews.content.substring(0, 200)}...</p>
              <Link
                to="/news"
                className="inline-block mt-4 text-accent hover:text-primary transition-colors font-semibold"
              >
                Read full post →
              </Link>
            </div>
          ) : (
            <div className="bg-black/60 backdrop-blur-sm p-6 rounded-xl border border-accent/30">
              <p className="text-cream">Loading news...</p>
            </div>
          )}
        </div>
      </div>

      {/* Section 4: Join the Inner Circle */}
      <div
        ref={(el) => (sectionsRef.current[3] = el)}
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        <div
          className="section-bg absolute inset-0 z-0 bg-cover bg-center transition-transform duration-300 will-change-transform"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format)',
            filter: 'brightness(0.4)',
          }}
        />
        <div className="relative z-10 text-center px-4 max-w-2xl">
          <Heart size={48} className="text-accent mx-auto mb-4" />
          <h2 className="font-display text-3xl md:text-4xl text-cream mb-4">Join the Inner Circle</h2>
          <p className="text-cream/80 text-lg mb-8">
            Get exclusive behind-the-scenes content, early looks at Book 2, and a community of readers who love stories that linger.
          </p>
          <Button variant="hero" size="lg" asChild>
             <a href="https://discord.com/invite/zbaugS2B2" target="_blank" rel="noopener noreferrer">
                  Become a member
                </a>
          </Button>
        </div>
      </div>

      {/* Footer (simple, not parallax) */}
      <footer className="bg-black text-gray-400 py-12 px-4 border-t border-accent/20">
        <div className="container mx-auto max-w-5xl text-center">
          <img
            src="/assets/favicon/web-app-manifest-192x192.png"
            alt="H00man Publishers"
            className="w-16 h-16 mx-auto mb-4 rounded-full border border-accent/30"
          />
          <p className="font-display text-2xl text-cream mb-2">H00man Publishers</p>
          <p className="text-sm">Where every story finds its home.</p>
          <div className="flex justify-center gap-6 mt-6">
            <a href="/privacy" className="hover:text-accent transition">Privacy</a>
            <a href="/terms" className="hover:text-accent transition">Terms</a>
            <a href="/contact" className="hover:text-accent transition">Contact</a>
          </div>
          <p className="text-xs mt-8">© 2026 H00man Publishers. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
