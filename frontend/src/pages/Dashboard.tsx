
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header, Footer, HistoryItem } from "@/components";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_HISTORY } from "@/lib/mockData";
import { RecommendationHistory } from "@/lib/types";
import { BarChart3, Calendar, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";


interface HistoryItem {
  _id: string;
  emotion: string;
  movies: Array<{
    id: number;
    title: string;
    poster_path?: string;
    vote_average: number;
    overview: string;
    release_date: string;
  }>;
  timestamp: string;
}


const Dashboard = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check for OAuth redirect params in URL hash
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = urlParams.get("access_token");

    if (accessToken) {
      // Store token from OAuth redirect
      localStorage.setItem("token", accessToken);
      sessionStorage.setItem("oauthSession", "true");
      // Clean up URL
      window.history.replaceState({}, document.title, "/dashboard");
    }

    // Check if authenticated through any method
    const token = localStorage.getItem("token");
    const oauthSession = sessionStorage.getItem("oauthSession");

    // Redirect if no authentication exists
    if (!token && !oauthSession) {
      navigate("/");
    }else {
      fetchHistory();
    }
  }, [navigate]);


    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const userEmail = localStorage.getItem('userEmail');
        const response = await fetch(`http://localhost:3000/api/auth/history?email=${userEmail}`);
        
        if (!response.ok) throw new Error('Failed to fetch history');
        
        const data = await response.json();
        setHistory(data);
        console.log(data);
      } catch (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };


    const handleDeleteItem = async (id: string) => {
      try {
        const userEmail = localStorage.getItem('userEmail');
        const response = await fetch(`http://localhost:3000/api/auth/history/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail })
        });
  
        if (!response.ok) throw new Error('Failed to delete history item');
        
        const updatedHistory = await response.json();
        setHistory(updatedHistory);
        
        toast({
          title: "Deleted",
          description: "History item has been removed.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    };

  const handleClearHistory = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      const response = await fetch('http://localhost:3000/api/auth/history', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });
      
      if (!response.ok) throw new Error('Failed to clear history');
      
      setHistory([]);
      
      toast({
        title: "History cleared",
        description: "Your recommendation history has been cleared.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-12 animate-slide-down">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Your Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Track your mood and movie recommendation history.
              </p>
            </div>
            
            {history.length > 0 && (
              <Button 
                variant="outline" 
                className="gap-2" 
                onClick={handleClearHistory}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4" />
                Clear history
              </Button>
            )}
          </div>
          
          <Tabs defaultValue="history" className="animate-fade-in">
            <TabsList className="mb-8">
              <TabsTrigger value="history" className="gap-2">
                <Calendar className="h-4 w-4" />
                History
              </TabsTrigger>
              <TabsTrigger value="insights" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Insights
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="history">
              {isLoading ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-muted rounded-lg"></div>
                  ))}
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-12 glass-panel animate-fade-in">
                  <h3 className="font-semibold text-lg mb-2">No history yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Your movie recommendation history will appear here once you start using the app.
                  </p>
                  <Button className="gap-2" onClick={() => navigate("/emotions")}>
                    <Calendar className="h-4 w-4" />
                    Find movies
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {history.map((item) => (
                    <div key={item._id} className="relative">
                      <HistoryItem history={{
                        _id: item._id,
                        emotion: item.emotion,
                        movies: item.movies,
                        timestamp: item.timestamp,
                      }} />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-12 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteItem(item._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="insights">
              <div className="glass-panel p-8 text-center animate-fade-in">
                <h3 className="font-semibold text-lg mb-2">Coming Soon</h3>
                <p className="text-muted-foreground">
                  Mood and movie preference insights will be available in a future update.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
