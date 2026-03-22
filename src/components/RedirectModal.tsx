import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RedirectModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title?: string;
}

const RedirectModal = ({ isOpen, onClose, url, title = 'the book page' }: RedirectModalProps) => {
  if (!isOpen) return null;

  const handleContinue = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card max-w-md w-full rounded-2xl shadow-2xl border border-accent/20 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display text-2xl text-accent">Leaving Our Site</h3>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <p className="text-muted-foreground mb-6">
            You're about to leave our site and visit <strong>{title}</strong> on an external retailer. From there, you can choose your preferred store to complete your purchase. Please note that we don't control the content or your experience on that site. Would you like to proceed?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              variant="hero"
              onClick={onClose}
              className="border-border hover:bg-accent/10"
            >
              Stay Here
            </Button>
            <Button
              onClick={handleContinue}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Continue to Store
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedirectModal;
