import { Scale, Mail, MapPin, Globe, Lock } from 'lucide-react';

const Privacy = () => {
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
            <Lock size={36} className="text-accent-foreground" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl mb-4 text-cream gold-glow">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">
            Last Updated: {currentDate}
          </p>
        </div>

        {/* Content */}
        <div className="bg-card text-card-foreground p-8 md:p-12 rounded-lg shadow-md space-y-8">
          
          <section className="space-y-4">
            <h2 className="font-display text-2xl text-accent border-b border-accent/20 pb-2">
              Our Commitment to Your Privacy
            </h2>
            <p className="leading-relaxed">
              At H00man Publishers, your privacy is not just a policy—it's a promise. We are committed to protecting the personal information you share with us and being transparent about how we use it. This policy explains our practices for the website <strong>hbooks-98a.pages.dev</strong> and any related services we offer.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl text-accent border-b border-accent/20 pb-2">
              Information We Collect
            </h2>
            <p className="leading-relaxed">
              We collect information to provide better services to our readers and community. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Information You Give Us:</strong> When you sign up for our newsletter, join our Discord, or contact us, we may ask for your name and email address.</li>
              <li><strong>Information We Get from Your Use:</strong> Like most websites, we automatically collect certain information to analyze trends and administer the site. This may include your IP address, browser type, and the pages you visit. We use this data in aggregate, not to identify individual users.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl text-accent border-b border-accent/20 pb-2">
              How We Use Your Information
            </h2>
            <p className="leading-relaxed">
              Any information we collect is used strictly for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To send you our newsletter and exclusive content (like deleted scenes) if you have subscribed.</li>
              <li>To respond to your comments, questions, or requests.</li>
              <li>To foster and manage our community, including our Discord server, "HB-inner circle."</li>
              <li>To improve our website and understand how readers interact with our content.</li>
              <li><strong>We will never sell or rent your personal information to third parties.</strong></li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl text-accent border-b border-accent/20 pb-2">
              Email Communications
            </h2>
            <p className="leading-relaxed">
              We use MailerLite to manage our email newsletter. When you sign up, your email address is stored securely on MailerLite's servers. You can unsubscribe from these communications at any time by clicking the "unsubscribe" link at the bottom of any email we send. For more information, please see <a href="https://www.mailerlite.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">MailerLite's Privacy Policy</a>.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl text-accent border-b border-accent/20 pb-2">
              Cookies and Tracking
            </h2>
            <p className="leading-relaxed">
              Our website may use "cookies" to enhance your experience. You can choose to have your computer warn you each time a cookie is being sent, or you can choose to turn off all cookies via your browser settings. If you disable cookies, some features of our site may not function properly.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl text-accent border-b border-accent/20 pb-2">
              Third-Party Links
            </h2>
            <p className="leading-relaxed">
              Our website contains links to third-party sites, such as our Discord server, Books2Read (for purchasing books), and social media platforms. We are not responsible for the privacy practices or the content of these external sites. We encourage you to read their privacy policies.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl text-accent border-b border-accent/20 pb-2">
              Your Rights (GDPR & CCPA)
            </h2>
            <p className="leading-relaxed">
              Depending on your location, you may have specific rights regarding your personal information, such as the right to access, correct, or delete the data we hold about you. If you wish to exercise these rights, please contact us using the information below.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl text-accent border-b border-accent/20 pb-2">
              Changes to This Policy
            </h2>
            <p className="leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page with an updated "Last Updated" date. We advise you to review this page periodically for any changes.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl text-accent border-b border-accent/20 pb-2">
              Contact Us
            </h2>
            <p className="leading-relaxed">
              If you have any questions about this Privacy Policy, please reach out:
            </p>
            <div className="flex flex-col space-y-3 pl-2">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-accent" />
                <a href="mailto:h00manpublishers@gmail.com" className="hover:text-accent transition-colors">
                  h00manpublishers@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-accent" />
                <span>County Antrim, Northern Ireland</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Privacy;