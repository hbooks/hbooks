import { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      category: "About the Author",
      questions: [
        {
          q: "Who is Raphael M. Mwaura?",
          a: "Raphael M. Mwaura is an author from County Antrim, Northern Ireland. He writes stories about the people we think we know, exploring themes of identity, family secrets, and the masks we wear. His debut novel is The Gilded Cage, the first book in the Lovely Strangers series."
        },
        {
          q: "What inspires your writing?",
          a: "I'm inspired by the realization that the people closest to us can sometimes feel like strangers. My writing explores the cages we build—from family expectations to our own hidden truths—and the moment we recognize the keys we hold."
        }
      ]
    },
    {
      category: "About the Website & Publisher",
      questions: [
        {
          q: "What is H00man Publishers?",
          a: "H00man Publishers is an independent publishing house dedicated to stories with heart and mystery. Our slogan, 'Where every story finds its home,' reflects our commitment to bringing narratives that linger long after the final page."
        },
        {
          q: "How do I join the Inner Circle?",
          a: "You can join by visiting the 'Books' page and clicking the 'Sign up for exclusive scenes' button. This will add you to our email list where you'll receive deleted scenes, updates on Book 2, and special announcements."
        },
        {
          q: "Is my email safe with you?",
          a: "Absolutely. We use MailerLite to manage our emails and will never sell or share your information. You can unsubscribe from any email with one click. For more details, please see our Privacy Policy."
        },
        {
          q: "How can I join the Discord community?",
          a: "You can join our Discord server, HB-inner circle, by clicking the Discord icon in the footer of any page. It's a space for readers to discuss the books, get exclusive sneak peeks, and vote on future content."
        }
      ]
    },
    {
      category: "About The Books",
      questions: [
        {
          q: "What is The Gilded Cage about?",
          a: "The Gilded Cage follows Remy Sot, a recent university graduate who must confront a lifetime of emotional miscalculation when his plans for romance fail. Set against the simmering tension between two rival counties, it's a story about friendship, betrayal, and the strangers we become to the ones who raised us."
        },
        {
          q: "Is The Gilded Cage part of a series?",
          a: "Yes, it's Book 1 of the Lovely Strangers series. Book 2 is currently in progress, and subscribers to the Inner Circle get early updates and exclusive scenes."
        },
        {
          q: "Where can I buy the book?",
          a: "You can purchase The Gilded Cage in ebook and print formats from major retailers like Amazon, Barnes & Noble, Kobo, and Apple Books. Use the 'Buy from your favourite store' button on the Books page, which will take you to our Books2Read link with all options."
        }
      ]
    }
  ];

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main className="min-h-screen bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-full bg-accent mx-auto mb-6 flex items-center justify-center">
            <HelpCircle size={36} className="text-accent-foreground" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl mb-4 text-cream gold-glow">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about the author, the books, and the community.
          </p>
        </div>

        <div className="space-y-8">
          {faqs.map((category, catIndex) => (
            <div key={catIndex} className="bg-card rounded-lg shadow-md overflow-hidden border border-accent/10">
              <h2 className="font-display text-2xl text-accent p-6 pb-2">
                {category.category}
              </h2>
              <div className="divide-y divide-accent/10">
                {category.questions.map((faq, qIndex) => {
                  const globalIndex = faqs.slice(0, catIndex).reduce((acc, c) => acc + c.questions.length, 0) + qIndex;
                  return (
                    <div key={qIndex} className="p-6">
                      <button
                        onClick={() => toggleQuestion(globalIndex)}
                        className="flex justify-between items-center w-full text-left focus:outline-none"
                      >
                        <h3 className="font-display text-lg text-cream pr-8">{faq.q}</h3>
                        <ChevronDown
                          size={20}
                          className={`text-accent transform transition-transform duration-300 flex-shrink-0 ${
                            openIndex === globalIndex ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      <div
                        className={`mt-4 text-muted-foreground leading-relaxed transition-all duration-300 overflow-hidden ${
                          openIndex === globalIndex ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <p>{faq.a}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default FAQ;