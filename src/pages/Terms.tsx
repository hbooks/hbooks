import { Scale, FileText, AlertCircle, UserCheck, Globe, Mail } from 'lucide-react';

const Terms = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <main className="min-h-screen bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-full bg-accent mx-auto mb-6 flex items-center justify-center">
            <Scale size={36} className="text-accent-foreground" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl mb-4 text-cream gold-glow">
            Terms of Service
          </h1>
          <p className="text-muted-foreground">
            Last Updated: {currentDate}
          </p>
        </div>

        {/* Content */}
        <div className="bg-card text-card-foreground p-8 md:p-12 rounded-lg shadow-md space-y-8">

          <section className="space-y-4">
            <h2 className="font-display text-2xl text-accent border-b border-accent/20 pb-2">
              Agreement to Terms
            </h2>
            <p className="leading-relaxed">
              Welcome to the website of Raphael M. Mwaura and H00man Publishers. By accessing or using our website at <strong>hpbooks.uk/</strong>, you agree to be bound by these Terms of Service and our Privacy Policy. If you disagree with any part of these terms, you may not access the site.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl text-accent border-b border-accent/20 pb-2">
              Intellectual Property Rights
            </h2>
            <p className="leading-relaxed">
              Unless otherwise stated, we or our licensors own the intellectual property rights for all material on this site, including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The book "The Gilded Cage" and the "Lovely Strangers" series.</li>
              <li>All text, graphics, logos, and images.</li>
              <li>The name and branding of "H00man Publishers."</li>
            </ul>
            <p className="leading-relaxed">
              All rights are reserved. You may access this content for your personal, non-commercial use only. You must not:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Republish, sell, or redistribute material from this website without prior written consent.</li>
              <li>Reproduce or duplicate material for commercial purposes.</li>
              <li>Modify or create derivative works based on the content of this site.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl text-accent border-b border-accent/20 pb-2">
              Community Conduct (Discord & Comments)
            </h2>
            <p className="leading-relaxed">
              We foster a respectful community, particularly in our "HB-inner circle" Discord server. By participating, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Treat all members with respect. Harassment, hate speech, or bullying will not be tolerated.</li>
              <li>Avoid spamming, self-promotion, or disruptive behavior.</li>
              <li>Respect the confidentiality of any exclusive content shared in paid or private channels.</li>
            </ul>
            <p className="leading-relaxed">
              We reserve the right to remove any user from our community platforms at our sole discretion for violating these principles.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl text-accent border-b border-accent/20 pb-2">
              Purchases and Third-Party Links
            </h2>
            <p className="leading-relaxed">
              Our website provides links to third-party retailers (such as Amazon, Barnes & Noble, and others via Books2Read) for the purchase of our books. Any transaction you conduct through these links is solely between you and the third-party retailer. We are not responsible for the products, services, or content of these external sites.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl text-accent border-b border-accent/20 pb-2">
              No Warranties and Limitation of Liability
            </h2>
            <p className="leading-relaxed">
              Our website and its content are provided on an "as is" and "as available" basis. We make no representations or warranties of any kind, express or implied, regarding the operation or availability of the site, or the information, content, and materials included.
            </p>
            <p className="leading-relaxed">
              To the fullest extent permitted by law, in no event shall Raphael M. Mwaura or H00man Publishers be liable for any damages arising out of the use or inability to use this site or its content.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl text-accent border-b border-accent/20 pb-2">
              Governing Law
            </h2>
            <p className="leading-relaxed">
              These Terms shall be governed and construed in accordance with the laws of Northern Ireland, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl text-accent border-b border-accent/20 pb-2">
              Changes to Terms
            </h2>
            <p className="leading-relaxed">
              We reserve the right to modify or replace these Terms at any time. We will provide notice of significant changes by posting the new Terms on this page with an updated effective date. Your continued use of the site after any such changes constitutes your acceptance of the new Terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl text-accent border-b border-accent/20 pb-2">
              Contact Us
            </h2>
            <p className="leading-relaxed">
              If you have any questions about these Terms, please contact us:
            </p>
            <div className="flex items-center gap-3 pl-2">
              <Mail size={18} className="text-accent" />
              <a href="mailto:contact@hpbooks.uk" className="hover:text-accent transition-colors">
                contact@hpbooks.uk
              </a>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Terms;
