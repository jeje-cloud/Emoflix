import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header, Footer } from "@/components";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const TMDB_API_KEY =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlZTJhYTBjODE1NTQzNzkxNjIyMmIxZmYyOWE3ZGI4NiIsIm5iZiI6MTc0MDkyODAzOS41MTIsInN1YiI6IjY3YzQ3NDI3MTExY2RkNGVkOGI0YWUyMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.nmjaNuIPThzM0BrtWckOXBERsIELOoWImWjXHQ9mxqA";

const GuestSearchResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [movies, setMovies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  // Get search query from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get("query") || "";

  useEffect(() => {
    if (!query) {
      navigate("/");
      return;
    }
    fetchMovies();
  }, [query, navigate]);

  const fetchMovies = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${TMDB_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      if (data.results?.length > 0) {
        setMovies(data.results);
      } else {
        setError("No movies found for this search.");
      }
    } catch (error) {
      setError(`Failed to fetch movies: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleReadMore = (id: number) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLoginClick = () => {
    navigate("/auth");
  };

  const MovieCard = ({ movie }) => (
    <Card className="overflow-hidden rounded-lg shadow-lg transition-transform duration-300 h-full flex flex-col cursor-pointer">
      {movie.poster_path ? (
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
          className="w-full h-80 object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-80 bg-muted flex items-center justify-center">
          <span className="text-muted-foreground">No image available</span>
        </div>
      )}
      <CardContent className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">{movie.title}</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          {expanded[movie.id] || movie.overview.length <= 100
            ? movie.overview
            : `${movie.overview.substring(0, 100)}...`}
          {movie.overview.length > 100 && (
            <button onClick={() => toggleReadMore(movie.id)} className="text-blue-500 ml-1">
              {expanded[movie.id] ? "Read less" : "Read more"}
            </button>
          )}
        </p>
        <div className="mt-auto flex justify-between items-center">
          <span className="text-sm text-yellow-500 font-medium">
            ⭐ {movie.vote_average?movie.vote_average.toFixed(1):" N/A"}
          </span>
          <span className="text-xs text-muted-foreground">
            {movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"}
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
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Home
              </Button>
              <h1 className="text-3xl md:text-4xl font-bold">
                Search Results for "{query}"
              </h1>
              <p className="text-muted-foreground mt-2">
                Preview of movies matching your search
              </p>
            </div>
          </div>

          <div className="text-center mb-8">
            <p className="text-lg text-muted-foreground mb-4">
              To enjoy full benefits and watch trailers, please log in first.
            </p>
            <Button onClick={handleLoginClick} size="lg">
              Log In
            </Button>
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
            </div>
          ) : movies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No movies found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GuestSearchResults;