import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import bookCover from '@/assets/gilded-cage-cover.png';

gsap.registerPlugin(ScrollTrigger);

interface NewsPost {
  title: string;
  date: string;
  content: string;
}

const fallbackNews: NewsPost = {
  title: 'Join Our New Discord Community!',
  date: '2026-02-26',
  content:
    'We have just launched our brand-new Discord server! Come hang out, chat about books, and get early updates on upcoming releases. This is where you\'ll find exclusive sneak peeks, behind-the-scenes notes, and direct conversations with the author.',
};

const Particles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 25 }).map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full bg-accent opacity-20"
        style={{
          width: `${2 + Math.random() * 4}px`,
          height: `${2 + Math.random() * 4}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `float ${4 + Math.random() * 6}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 3}s`,
        }}
      />
    ))}
  </div>
);

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const stickyContainerRef = useRef<HTMLDivElement>(null);
  const stickyVideoRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Fetch latest news (optional – you can keep real-time if you want)
    const fetchLatestNews = async () => {
      const { data, error } = await supabase
        .from('news_posts')
        .select('title, date, content')
        .eq('published', true)
        .order('date', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        // You can add useState and update the news section if desired
      }
    };
    fetchLatestNews();

    // Realtime subscription (optional)
    const subscription = supabase
      .channel('public:news_posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'news_posts' }, fetchLatestNews)
      .subscribe();

    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Film roll header animation
    const headerElements = gsap.utils.toArray<HTMLElement>('.hero-text > *');
    const heroTl = gsap.timeline({
      scrollTrigger: {
        trigger: heroRef.current,
        start: 'top top',
        end: '+=300',
        scrub: 0.5,
      },
    });
    headerElements.forEach((el, i) => {
      heroTl.to(
        el,
        {
          rotationX: 90,
          y: -30,
          opacity: 0,
          transformOrigin: 'center top',
          duration: 1,
        },
        i * 0.08
      );
    });

    // Sticky book cover expansion + text reveal
    if (stickyContainerRef.current && stickyVideoRef.current) {
      const stickyTl = gsap.timeline({
        scrollTrigger: {
          trigger: stickyContainerRef.current,
          start: 'top top',
          end: '+=100%',
          scrub: 1,
          pin: stickyVideoRef.current,
          anticipatePin: 1,
        },
      });

      stickyTl
        .fromTo(
          stickyVideoRef.current,
          { scale: 0.8, borderRadius: '2rem' },
          { scale: 1, borderRadius: '0rem', duration: 1, ease: 'power2.out' }
        )
        .fromTo(
          '.reveal-text',
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.5'
        );
    }

    // Footer reveal
    if (footerRef.current) {
      gsap.fromTo(
        footerRef.current,
        { opacity: 0, y: 100 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top bottom',
            end: 'top center',
            scrub: 0.5,
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      lenis.destroy();
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="bg-secondary">
      {/* Hero section – film roll effect */}
      <section
        ref={heroRef}
        className="hero-gradient min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      >
        <Particles />
        <div className="container mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10 hero-text">
          <div className="flex-1 text-center md:text-left">
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold mb-4 text-cream gold-glow">
              The Gilded Cage
            </h1>
            <p className="text-xl italic text-accent mb-2">Lovely Strangers, Book 1</p>
            <p className="text-lg mb-8 text-cream opacity-80">Romance with a twist of mystery.</p>
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
          <div className="flex-shrink-0">
            <img
              src={bookCover}
              alt="The Gilded Cage - Book Cover"
              className="w-56 sm:w-64 md:w-80 rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Sticky book cover expansion section */}
      <div ref={stickyContainerRef} className="relative bg-secondary">
        <div ref={stickyVideoRef} className="sticky top-0 w-full h-screen flex items-center justify-center z-20">
          <div className="relative w-full max-w-5xl mx-auto px-4">
            <img
              src={bookCover}
              alt="The Gilded Cage"
              className="w-64 sm:w-80 md:w-96 mx-auto rounded-2xl shadow-2xl border-2 border-accent/30"
            />
            <div className="reveal-text text-center mt-8 max-w-2xl mx-auto">
              <h2 className="font-display text-3xl text-cream mb-4">A Story of Strangers</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Remy Sot thought he knew the people closest to him. But when graduation brings rejection instead of romance,
                he's forced to confront a lifetime of emotional miscalculation – and the loneliness he's carried since childhood.
                Set against the simmering tension between two rival counties, this is a story about friendship, betrayal, and the
                strangers we become to the ones who raised us.
              </p>
            </div>
          </div>
        </div>
        <div className="h-[200vh]" /> {/* Spacer to allow scrolling past the sticky section */}
      </div>

      {/* Latest News section */}
      <section className="py-24 px-4 bg-gradient-to-b from-secondary to-gray-900">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="font-display text-4xl md:text-5xl text-cream mb-8">Latest from the Desk</h2>
          <div className="bg-card p-8 rounded-2xl shadow-xl border border-border">
            <h3 className="font-display text-2xl text-accent mb-3">Join Our New Discord Community!</h3>
            <p className="text-muted-foreground text-sm mb-4">February 26, 2026</p>
            <p className="text-foreground opacity-90 leading-relaxed">
              We have just launched our brand-new Discord server! Come hang out, chat about books, and get early updates on
              upcoming releases. This is where you'll find exclusive sneak peeks, behind-the-scenes notes, and direct conversations
              with the author.
            </p>
          </div>
          <Link
            to="/news"
            className="inline-block mt-8 text-accent hover:text-primary transition-colors font-semibold"
          >
            All news →
          </Link>
        </div>
      </section>

      {/* Footer section with reveal animation */}
      <footer
        ref={footerRef}
        className="bg-gray-900 text-gray-400 py-16 px-4 border-t border-accent/20"
      >
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
