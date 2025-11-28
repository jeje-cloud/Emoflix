
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header, Footer } from "@/components";
import { ChevronRight, Film, Smile, BarChart3 } from "lucide-react";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

const Index = () => {
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-slide-up", "opacity-100");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    featureRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      featureRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  const handleGoogleAuth = () => {
    window.open("https://accounts.google.com/o/oauth2/auth?client_id=751047087683-kd88h5t67glb9c12b2g12svtr9a3a4co.apps.googleusercontent.com&redirect_uri=http://localhost:8080&response_type=token&scope=email%20profile", "_self");
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background YouTube Video */}
      
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <iframe
          className="absolute top-0 left-0 w-full h-full object-cover opacity-90 blur-lg"
          src="https://www.youtube.com/embed/zSWdZVtXT7E?autoplay=1&mute=1&loop=1&playlist=zSWdZVtXT7E"
          title="Background Video"
          frameBorder="0"
          allow="autoplay; fullscreen"
          style={{ width: "100vw", height: "100vh", filter: "blur(25px)" }}
        />
      </div>
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/20 dark:from-primary/10 dark:to-background z-0">
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-radial from-primary/20 to-transparent dark:from-primary/10 opacity-60 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-accent/20 to-transparent dark:from-accent/10 opacity-60 blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-gradient-radial from-secondary/30 to-transparent dark:from-secondary/20 opacity-70 blur-3xl animate-float"></div>
        
        {/* Animated circles */}
        <div className="absolute top-[20%] right-[10%] w-[100px] h-[100px] rounded-full bg-primary/10 dark:bg-primary/20 blur-xl animate-float opacity-60"></div>
        <div className="absolute bottom-[30%] left-[5%] w-[150px] h-[150px] rounded-full bg-accent/10 dark:bg-accent/20 blur-xl animate-float opacity-70" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-[60%] right-[20%] w-[120px] h-[120px] rounded-full bg-secondary/20 dark:bg-secondary/30 blur-xl animate-float opacity-50" style={{ animationDelay: "2s" }}></div>
      </div>

      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-slide-down">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              <span className="text-gradient">{APP_NAME}</span>
              <span className="block mt-2 text-3xl">{APP_DESCRIPTION}</span>
            </h1>
            <p className="max-w-3xl mx-auto text-lg sm:text-xl text-muted-foreground mb-10">
              Discover movies perfectly tailored to your emotional state. Our intelligent system recommends films that resonate with how you're feeling right now.
            </p>
          </div>

          <div className="animate-slide-up">
          <Link to="/auth">
              <Button size="lg" className="group relative overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-primary/80 to-accent/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10">Get Started</span>
                <ChevronRight className="relative z-10 ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-secondary/30 dark:bg-secondary/10 relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div 
              ref={(el) => (featureRefs.current[0] = el)}
              className="flex flex-col items-center text-center opacity-0 transition-all duration-500 backdrop-blur-sm bg-background/50 dark:bg-background/30 p-6 rounded-lg border border-border shadow-sm"
            >
              <div className="rounded-full bg-primary/10 p-4 mb-6">
                <Smile className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Share Your Mood</h3>
              <p className="text-muted-foreground">
                Select your current emotion from our intuitive interface, or let our system detect it for you.
              </p>
            </div>

            <div 
              ref={(el) => (featureRefs.current[1] = el)}
              className="flex flex-col items-center text-center opacity-0 transition-all duration-500 delay-200 backdrop-blur-sm bg-background/50 dark:bg-background/30 p-6 rounded-lg border border-border shadow-sm"
            >
              <div className="rounded-full bg-primary/10 p-4 mb-6">
                <Film className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Get Recommendations</h3>
              <p className="text-muted-foreground">
                Receive personalized movie suggestions that complement or enhance your emotional state.
              </p>
            </div>

            <div 
              ref={(el) => (featureRefs.current[2] = el)}
              className="flex flex-col items-center text-center opacity-0 transition-all duration-500 delay-400 backdrop-blur-sm bg-background/50 dark:bg-background/30 p-6 rounded-lg border border-border shadow-sm"
            >
              <div className="rounded-full bg-primary/10 p-4 mb-6">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Track History</h3>
              <p className="text-muted-foreground">
                Review your emotional journey and discover patterns in your movie preferences over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6 bg-gradient-to-b from-background to-secondary/20 dark:from-background dark:to-secondary/10 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to match movies to your mood?</h2>
          <p className="text-lg text-muted-foreground mb-10">
            Join {APP_NAME} today and transform how you experience cinema.
          </p>
          <Link to="/auth">
              <Button size="lg" className="group relative overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-primary/80 to-accent/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10">Get Started</span>
                <ChevronRight className="relative z-10 ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
        </div>
      </section>

      <div className="relative z-20 bg-background/80 backdrop-blur-none">
         <Footer />
       </div>

    </div>
  );
};

export default Index;
