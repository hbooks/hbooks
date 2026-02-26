import { User, BookOpen } from 'lucide-react';

const About = () => (
  <main className="min-h-screen">
    {/* Author Section */}
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="font-display text-4xl md:text-5xl text-center mb-12">About the Author</h1>
        <div className="flex flex-col md:flex-row gap-10 items-start">
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <div className="w-48 h-48 rounded-full bg-secondary flex items-center justify-center shadow-lg">
              <User size={64} className="text-accent" />
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <blockquote className="border-l-4 border-accent pl-4 italic text-lg text-muted-foreground mb-6">
              "The most dangerous conflicts aren't fought with weapons, but with secrets kept across dinner tables and decades."
            </blockquote>
            <p className="leading-relaxed">
              Raphael M. Mwaura has been crafting stories since 2019, developing a voice that moves with quiet confidence between the tenderness of human connection and the darkness of buried truths. With <em className="text-primary font-semibold">The Gilded Cage</em>, he delivers a debut novel that announces a writer deeply invested in the spaces we don't talk about—the silences between generations, the weight of unspoken expectation, and the moment a young person realizes the life they're living was designed by someone else.
            </p>
            <p className="leading-relaxed">
              His characters arrive fully formed: Remy's sharp hunger for answers, Mika's careful armor of charm, Adanna's devastating stillness. These are people rendered by an author who understands that the most dangerous conflicts aren't fought with weapons, but with secrets kept across dinner tables and decades.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* Publisher Section */}
    <section className="bg-secondary text-secondary-foreground py-16 px-4">
      <div className="container mx-auto max-w-3xl text-center">
        <div className="w-20 h-20 rounded-full bg-accent mx-auto mb-6 flex items-center justify-center">
          <BookOpen size={36} className="text-accent-foreground" />
        </div>
        <h2 className="font-display text-3xl md:text-4xl mb-6">About H00man Publisher</h2>
        <p className="leading-relaxed text-secondary-foreground opacity-90 mb-6">
          <strong>H00man Publisher</strong> is where every story finds its home. We believe that the best stories don't just entertain—they linger in the mind long after the final page is turned. Founded to champion voices that blend emotion with intrigue, we are dedicated to bringing stories with heart and mystery to readers who crave depth.
        </p>
        <p className="font-display text-xl italic text-accent">
          "Where every story finds its home."
        </p>
      </div>
    </section>
  </main>
);

export default About;
