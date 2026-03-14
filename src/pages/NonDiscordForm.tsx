import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ArrowRight } from 'lucide-react';

// Extend Window for Sender explicit API
declare global {
  interface Window {
    senderForms?: {
      render: (formIds: string[], config?: { initialStatus?: string }) => void;
    };
    senderFormsLoaded?: boolean;
  }
}

const NonDiscordForm = () => {
  // Explicit rendering for Sender popup (form ID: e31x7n)
  useEffect(() => {
    const FORM_ID = 'e31x7n';

    const renderSenderForms = () => {
      if (window.senderForms && window.senderForms.render) {
        window.senderForms.render([FORM_ID], { initialStatus: 'enabled' });
        console.log('Sender popup rendered for non‑Discord form');
      }
    };

    if (window.senderFormsLoaded) {
      renderSenderForms();
    } else {
      const handleReady = () => renderSenderForms();
      window.addEventListener('onSenderFormsLoaded', handleReady);
      return () => window.removeEventListener('onSenderFormsLoaded', handleReady);
    }
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-amber-100">
          
          {/* Icon */}
          <div className="w-24 h-24 bg-amber-600 rounded-full mx-auto mb-8 flex items-center justify-center shadow-lg shadow-amber-200">
            <MessageCircle size={48} className="text-white" />
          </div>

          {/* Heading */}
          <h1 className="font-display text-4xl md:text-5xl text-gray-900 mb-4">
            You're here because you don't use Discord
          </h1>
          
          <p className="text-xl text-gray-600 mb-6">
            … and that's perfectly okay. You can still enjoy all the exclusive Inner Circle content.
          </p>

          <p className="text-lg text-gray-600 mb-10 max-w-lg mx-auto">
            Just click the big button below, fill in your email, and we'll send you a link to our private cloud library – no Discord account needed.
          </p>

          {/* Big Visible Button */}
          <button
            id="start"
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-2xl px-12 py-6 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 inline-flex items-center gap-3 mx-auto"
          >
            Start the process <ArrowRight size={28} />
          </button>

          {/* Supportive footer */}
          <p className="text-sm text-gray-500 mt-12 border-t border-gray-200 pt-6">
            Prefer Discord? <Link to="/discord" className="text-amber-600 hover:underline">Join us there</Link> instead.
          </p>
        </div>
      </div>
    </main>
  );
};

export default NonDiscordForm;