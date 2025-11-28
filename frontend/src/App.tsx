
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import EmotionDetection from "./pages/EmotionDetection";
import MovieRecommendations from "./pages/MovieRecommendations";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Explore from "./pages/Explore";
import SearchResults from "./pages/SearchResults";
import GuestSearchResults from "./pages/GuestSearchResults";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/guest-search" element={<GuestSearchResults />} />
            <Route path="/emotions" element={<EmotionDetection />} />
            <Route path="/recommendations/:emotionId" element={<MovieRecommendations />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
