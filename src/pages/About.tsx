import { BookOpen } from 'lucide-react';

const About = () => {
  const authorPhoto = '@/assets/Authorprofilepicture.png';
  const publisherLogo = '/assets/favicon/web-app-manifest-192x192.png';

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white">
      {/* Author Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="font-display text-4xl md:text-5xl text-center mb-12 text-cream gold-glow">
            About the Author
          </h1>
          <div className="flex flex-col md:flex-row gap-10 items-start">
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <img
                src={authorPhoto}
                alt="Raphael M. Mwaura"
                className="w-48 h-48 rounded-full object-cover shadow-lg border-2 border-accent"
              />
            </div>
            <div className="flex-1 space-y-4">
              <blockquote className="border-l-4 border-accent pl-4 italic text-lg text-muted-foreground mb-6">
                "Are you a stranger to the people you love—or are you a stranger to yourself?"
              </blockquote>

              <p className="leading-relaxed">
                Raphael M. Mwaura writes about the people we think we know. Born and raised in{' '}
                <strong>County Antrim, Northern Ireland</strong>, Raphael grew up noticing something
                strange about the people closest to him. Friends he'd known for years would suddenly
                feel like strangers. Family members would reveal sides he'd never seen. Lovers would
                become unfamiliar overnight.
              </p>

              <p className="leading-relaxed">
                At first, he thought they were changing. Then he realized: they weren't changing at
                all. They were finally stopping the performance. The person he'd been spending time
                with wasn't the real them—it was the version they wanted him to see. And when the
                mask slipped? He was left holding memories of someone who never really existed.
              </p>

              <p className="leading-relaxed">
                This realization became the engine behind everything he writes. Because there are
                things that hold us hostage. Cages built by family. By secrets. By the stories we
                tell ourselves about who we are. And here's the truth Raphael writes toward: telling
                people about the cage doesn't guarantee freedom. Knowledge is one key. But the
                chains on our legs? Those require something else entirely.
              </p>

              <p className="leading-relaxed">
                In the <em className="text-primary font-semibold">Lovely Strangers</em> series, he
                asks one question over and over:{' '}
                <em className="text-primary font-semibold">
                  "Are you a stranger to the people you love—or are you a stranger to yourself?"
                </em>
              </p>

              <p className="leading-relaxed">
                His characters are people standing at that exact crossroads. They're graduates
                stepping into lives their parents built. They're lovers realizing they loved a
                reflection. They're children of war learning that the war never really ended—it just
                moved underground.
              </p>

              <p className="leading-relaxed">
                What readers find in his work: Romance that doesn't look away from the hard parts.
                Mystery that's not just about <em>what happened</em>, but <em>who was really
                there</em>. Characters who feel like people you've known—until they show you the
                side you never saw. Stories that sit with you after the last page, asking:{' '}
                <em>wait... have I done this too?</em>
              </p>

              <p className="leading-relaxed">
                What keeps him writing? The hope that someone, somewhere, will read his words and
                feel a little less alone in the strangeness of being human. That they'll see their
                own lovely strangers on the page—and maybe, just maybe, recognize the chains they're
                ready to unlock.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Publisher Section */}
      <section className="bg-secondary/50 backdrop-blur-sm text-secondary-foreground py-16 px-4 border-t border-accent/20">
        <div className="container mx-auto max-w-3xl text-center">
          <img
            src={publisherLogo}
            alt="H00man Publishers"
            className="w-20 h-20 rounded-full mx-auto mb-6 border-2 border-accent"
          />
          <h2 className="font-display text-3xl md:text-4xl mb-6">About H00man Publisher</h2>
          <p className="leading-relaxed text-secondary-foreground opacity-90 mb-6">
            <strong>H00man Publisher</strong> is where every story finds its home. We believe that
            the best stories don't just entertain—they linger in the mind long after the final page
            is turned. Founded to champion voices that blend emotion with intrigue, we are dedicated
            to bringing stories with heart and mystery to readers who crave depth.
          </p>
          <p className="font-display text-xl italic text-accent">
            "Where every story finds its home."
          </p>
        </div>
      </section>
    </main>
  );
};

export default About;
