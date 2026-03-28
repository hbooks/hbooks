import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import AutoReload from "./components/AutoReload";
import NonDiscordForm from "./pages/NonDiscordForm";
import AdminPage from './pages/AdminPage';
import Stores from './pages/Stores';
import PostToDiscord from './pages/PostToDiscord';
import FAQ from "./pages/FAQ";
import Helpline from "./pages/Helpline";
import NotFound from "./pages/NotFound";
import { AuthProvider } from './contexts/AuthContext';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname === '/ir806x40' || location.pathname === '/pt005Dcd';

  return (
    <>
      {!isAdminRoute && <Navbar />}
      {children}
      {!isAdminRoute && <Footer />}
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
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
              <Route path="/ir806x40" element={<AdminPage />} />
              <Route path="/stores" element={<Stores />} />
              <Route path="/pt005Dcd" element={<PostToDiscord />} />
              <Route path="/thankyoupage" element={<ThankYou />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/helpline" element={<Helpline />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
          <AutoReload />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  );
};

export default App;
