import { MapPin, BookOpen, Mail, Users, ShoppingBag, HelpCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const Helpline = () => {
  const sections = [
    {
      icon: BookOpen,
      title: "Finding & Buying Books",
      steps: [
        "Navigate to the 'Books' page from the main menu.",
        "Read the description and praise for The Gilded Cage.",
        "Click the 'Buy from your favourite store' button. A modal will appear explaining you're leaving the site.",
        "Click 'Continue to Store' to be taken to Books2Read, where you can choose your preferred retailer (Amazon, Kobo, Apple Books, etc.)."
      ]
    },
    {
      icon: Mail,
      title: "Signing Up for Exclusive Content",
      steps: [
        "On the 'Books' page, click the prominent 'Sign up for exclusive scenes' button.",
        "A MailerLite pop-up form will appear. Enter your name and email address.",
        "Check your inbox for a confirmation email and click the link to verify your address.",
        "Once confirmed, you'll start receiving exclusive deleted scenes, behind‑the‑content, and updates on Book 2."
      ],
      note: "You can unsubscribe from any email with one click. We respect your privacy."
    },
    {
      icon: Users,
      title: "Joining the Discord Community (HB-inner circle)",
      steps: [
        "Click the Discord icon in the footer of any page.",
        "If you're not already a member, you'll be prompted to join the server.",
        "Once inside, read the #welcome channel for rules and an introduction.",
        "Introduce yourself in #introductions and check out #the-circle-speaks to vote on future content!"
      ]
    },
    {
      icon: ShoppingBag,
      title: "Purchasing Exclusive Digital Content",
      steps: [
        "Visit our 'Shop' page via the Buy Exclusive scenes on the footer. Select the 'One-time visitor' path from our recruitment site.",
        "Browse the available items: Chapter Leaks, Behind the Scenes, Deleted Scenes Collection.",
        "Click 'View on Ko-fi' for the item you want. A pop-up modal will open with the Ko-fi product page.",
        "Complete your purchase on Ko-fi. You'll receive a download link immediately."
      ]
    },
    {
      icon: HelpCircle,
      title: "Getting Further Help",
      steps: [
        "If you can't find what you're looking for here, visit the 'Contact' page.",
        "Fill out the contact form with your name, email, and message.",
        "You'll receive an auto-reply confirmation, and your message will be sent directly to the author.",
        "For immediate assistance, you can also ask in the Discord community."
      ]
    }
  ];

  return (
    <main className="min-h-screen bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-full bg-accent mx-auto mb-6 flex items-center justify-center">
            <MapPin size={36} className="text-accent-foreground" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl mb-4 text-cream gold-glow">
            Site Guide & Helpline
          </h1>
          <p className="text-muted-foreground text-lg">
            Your roadmap to navigating hpbooks and getting the most out of your experience.
          </p>
        </div>

        <div className="space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div key={index} className="bg-card rounded-lg shadow-md p-8 border border-accent/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Icon className="text-accent" size={28} />
                  </div>
                  <h2 className="font-display text-2xl text-accent">{section.title}</h2>
                </div>
                <div className="space-y-4">
                  <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                    {section.steps.map((step, i) => (
                      <li key={i} className="leading-relaxed">{step}</li>
                    ))}
                  </ol>
                  {section.note && (
                    <p className="text-sm text-accent/80 bg-accent/5 p-3 rounded-lg italic">
                      💡 {section.note}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center p-8 bg-accent/5 rounded-lg border border-accent/20">
          <p className="text-muted-foreground">
            Still need help? Visit our <Link to="/contact" className="text-accent hover:underline">Contact</Link> page or join the <a href="https://discord.gg/zbaugS2B2" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline inline-flex items-center gap-1">Discord community <ExternalLink size={14} /></a>.
          </p>
        </div>
      </div>
    </main>
  );
};

export default Helpline;
