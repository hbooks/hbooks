import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import About from "./pages/About";
import Books from "./pages/Books";
import News from "./pages/News";
import Reviews from "./pages/Reviews";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import Support from "./pages/Support";
import ThankYou from "./pages/ThankYou";
import Library from "./pages/Library";
import NonDiscordForm from "./pages/NonDiscordForm";
import FAQ from "./pages/FAQ";
import Helpline from "./pages/Helpline";
import NotFound from "./pages/NotFound";
import { supabase } from "@/lib/supabase";

const queryClient = new QueryClient();

// Layout component that conditionally shows Navbar and Footer
const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname === '/ir806';

  return (
    <>
      {!isAdminRoute && <Navbar />}
      {children}
      {!isAdminRoute && <Footer />}
    </>
  );
};

const App = () => {
  // Global error handler – logs frontend errors to Supabase
  useEffect(() => {
    const originalErrorHandler = window.onerror;
    window.onerror = async (message, source, lineno, colno, error) => {
      // Call original handler if any
      if (originalErrorHandler) {
        originalErrorHandler(message, source, lineno, colno, error);
      }

      // Try to log to Supabase – silently fail if not authenticated or table missing
      try {
        await supabase.from('system_errors').insert({
          error_message: String(message),
          error_stack: error?.stack,
          url: window.location.href,
          user_agent: navigator.userAgent,
        });
      } catch (err) {
        console.error('Failed to log error to Supabase', err);
      }
    };

    // Cleanup: restore original handler when component unmounts
    return () => {
      window.onerror = originalErrorHandler;
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/books" element={<Books />} />
              <Route path="/news" element={<News />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/support" element={<Support />} />
              <Route path="/library" element={<Library />} />
              <Route path="/nonDiscordForm" element={<NonDiscordForm />} />
              
              <Route path="/thankyoupage" element={<ThankYou />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/helpline" element={<Helpline />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
