import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface NewsPost {
  id: number;
  title: string;
  content: string;
  date: string;
}

const fallbackNews: NewsPost[] = [
  {
    id: 1,
    title: 'Join Our New Discord Community!',
    date: '2026-02-26T10:00:00Z',
    content: 'We have just launched our brand-new Discord server! Come hang out, chat about books, and get early updates on upcoming releases. This is where you\'ll find exclusive sneak peeks, behind-the-scenes notes, and direct conversations with the author. Whether you\'re a longtime reader or new to the Lovely Strangers series, there\'s a place for you. Click the link below to join us!',
  },
];

const News = () => {
  const [news, setNews] = useState<NewsPost[]>(fallbackNews);
  const [likes, setLikes] = useState<Record<string, number>>({});

  useEffect(() => {
    supabase
      .from('news_posts')
      .select('id, title, content, date')
      .eq('published', true)
      .order('date', { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) setNews(data);
      });

    supabase
      .from('news_likes')
      .select('news_title, like_count')
      .then(({ data }) => {
        if (data) {
          const map: Record<string, number> = {};
          data.forEach(r => { map[r.news_title] = r.like_count; });
          setLikes(map);
        }
      });
  }, []);

const handleLike = async (title: string) => {
  setLikes(prev => ({ ...prev, [title]: (prev[title] || 0) + 1 }));

  const { data, error } = await supabase.rpc('increment_like', { p_news_title: title });

  if (error) {
    console.error('Like error:', error);
    setLikes(prev => ({ ...prev, [title]: (prev[title] || 0) - 1 }));
  } else if (typeof data === 'number') {
    setLikes(prev => ({ ...prev, [title]: data }));
  }
};
  return (
    <main className="min-h-screen bg-secondary text-secondary-foreground py-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="font-display text-4xl md:text-5xl text-center mb-12 text-cream gold-glow">
          News & Updates
        </h1>
        <div className="space-y-8">
          {news.map(post => (
            <article
              key={post.id}
              className="bg-card text-card-foreground p-8 rounded-lg shadow-md border border-border animate-fade-in-up"
            >
              <h2 className="font-display text-2xl mb-2">{post.title}</h2>
              <p className="text-muted-foreground text-sm mb-4">
                {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="leading-relaxed mb-4">{post.content}</p>
              <div className="flex justify-end items-center gap-2">
                <button
                  onClick={() => handleLike(post.title)}
                  className="flex items-center gap-1.5 text-accent hover:text-primary transition-colors group"
                >
                  <Heart size={18} className="group-hover:fill-current transition-all" />
                  <span className="text-sm font-medium">{likes[post.title] || 0}</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
};

export default News;
