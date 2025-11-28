import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header, Footer } from "@/components";
import { ArrowLeft, RefreshCcw, ThumbsUp, Bookmark } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

const TMDB_API_KEY =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlZTJhYTBjODE1NTQzNzkxNjIyMmIxZmYyOWE3ZGI4NiIsIm5iZiI6MTc0MDkyODAzOS41MTIsInN1YiI6IjY3YzQ3NDI3MTExY2RkNGVkOGI0YWUyMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.nmjaNuIPThzM0BrtWckOXBERsIELOoWImWjXHQ9mxqA";
const Explore = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    // Check for OAuth redirect params in URL hash
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = urlParams.get("access_token");

    if (accessToken) {
      // Store token from OAuth redirect
      localStorage.setItem("token", accessToken);
      sessionStorage.setItem("oauthSession", "true");
      // Clean up URL
      window.history.replaceState({}, document.title, "/explore");
    }

    // Check if authenticated through any method
    const token = localStorage.getItem("token");
    const oauthSession = sessionStorage.getItem("oauthSession");

    // Redirect if no authentication exists
    if (!token && !oauthSession) {
      navigate("/");
    }
  }, [navigate]);

  const fetchMovies = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/discover/movie`,
        {
          headers: {
            Authorization: `Bearer ${TMDB_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setMovies(data.results); // Show all movies from the first page
      } else {
        setError("No movies found");
      }
    } catch (error) {
      setError(`Failed to fetch movies: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleRefresh = () => {
    fetchMovies();
    toast({
      title: "Recommendations refreshed",
      description: "Here are some new movie suggestions for you.",
    });
  };

  const handleSaveToHistory = () => {
    toast({
      title: "Saved to history",
      description: "These recommendations have been saved to your history.",
    });
  };

  const toggleReadMore = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openTrailer = async (movieId) => {
    try {
      const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos`, {
        headers: {
          Authorization: `Bearer ${TMDB_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      const trailer = data.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');

      if (trailer) {
        const trailerPopup = window.open('', 'Trailer', 'width=1000,height=600,left=' + (window.innerWidth - 1200) / 2 + ',top=' + (window.innerHeight - 600) / 2);
        trailerPopup.document.write(`
          <html>
            <body style="margin:0;padding:0;display:flex;justify-content:center;align-items:center;height:100vh;">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/${trailer.key}?autoplay=1"
                frameborder="0"
                allow="autoplay; encrypted-media"
                allowfullscreen
              ></iframe>
            </body>
          </html>
        `);
      } else {
        alert('Trailer not available');
      }
    } catch (error) {
      alert('Failed to fetch trailer');
    }
  };


  const MovieCard = ({ movie }) => (
    <Card
      className="overflow-hidden rounded-lg shadow-lg transition-transform duration-300 h-full flex flex-col cursor-pointer">
      {movie.poster_path ? (
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
          className="w-full h-80 object-cover"
          loading="lazy"
          onClick={() => openTrailer(movie.id)}
        />
      ) : (
        <div className="w-full h-80 bg-muted flex items-center justify-center">
          <span className="text-muted-foreground">No image available</span>
        </div>
      )}
      <CardContent className="p-4 flex flex-col flex-1">
        <h2 className="text-lg font-semibold mb-2">{movie.title}</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {expanded[movie.id] || movie.overview.length <= 100
            ? movie.overview
            : `${movie.overview.substring(0, 100)}...`}
          {movie.overview.length > 100 && (
            <button
              onClick={() => toggleReadMore(movie.id)}
              className="text-blue-500 ml-1"
            >
              {expanded[movie.id] ? "Read less" : "Read more"}
            </button>
          )}
        </p>
        <div className="mt-auto flex justify-between items-center">
          <span className="text-sm text-yellow-500 font-medium">
            ⭐ {movie.vote_average.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground">
            {movie.release_date
              ? new Date(movie.release_date).getFullYear()
              : "N/A"}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-12 animate-slide-down">
            <div>
              <Link
                to="/dashboard"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to dashboard
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold">
                Recommended Movies
              </h1>
              <p className="text-muted-foreground mt-2">
                Discover great movies from our collection.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </Button>
              <Button className="gap-2" onClick={handleSaveToHistory}>
                <Bookmark className="h-4 w-4" />
                Save to history
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-muted rounded-lg aspect-[2/3]"></div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <Button onClick={handleRefresh}>Try again</Button>
            </div>
          ) : movies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No movies found.</p>
              <Button onClick={handleRefresh} className="mt-4">
                Try again
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}

          {/* {!isLoading && !error && movies.length > 0 && (
            <div className="mt-12 text-center animate-fade-in">
              <p className="text-muted-foreground mb-4">
                How do you feel about these recommendations?
              </p>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => {
                  toast({
                    title: "Feedback received",
                    description: "Thank you for your feedback!",
                  });
                }}
              >
                <ThumbsUp className="h-4 w-4" />
                I like these recommendations
              </Button>
            </div> */}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Explore;
