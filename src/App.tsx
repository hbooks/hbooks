import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminPortal from "./components/AdminPortal";
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

const queryClient = new QueryClient();

const App = () => {
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar onAdminTrigger={() => setShowAdmin(true)} />
          <Routes>
  <Route path="/" element={<Index />} />
  <Route path="/about" element={<About />} />
  <Route path="/books" element={<Books />} />
  <Route path="/news" element={<News />} />
  <Route path="/reviews" element={<Reviews />} />
  <Route path="/contact" element={<Contact />} />
  <Route path="/support" element={<Support />} />
  <Route path="/library" element={<Library />} />
  {/* New routes */}
  <Route path="/nonDiscordForm" element={<NonDiscordForm />} />
  <Route path="/thankyoupage" element={<ThankYou />} />
  <Route path="/privacy" element={<Privacy />} />
  <Route path="/terms" element={<Terms />} />
  <Route path="/faq" element={<FAQ />} />
  <Route path="/helpline" element={<Helpline />} />
  <Route path="*" element={<NotFound />} />
</Routes>
          <Footer />
          <AdminPortal isOpen={showAdmin} onClose={() => setShowAdmin(false)} />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
