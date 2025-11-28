import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header, Footer } from "@/components";
import { ArrowLeft, RefreshCcw, Bookmark } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
const TMDB_API_KEY =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlZTJhYTBjODE1NTQzNzkxNjIyMmIxZmYyOWE3ZGI4NiIsIm5iZiI6MTc0MDkyODAzOS41MTIsInN1YiI6IjY3YzQ3NDI3MTExY2RkNGVkOGI0YWUyMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.nmjaNuIPThzM0BrtWckOXBERsIELOoWImWjXHQ9mxqA";

  const YOUTUBE_API_KEY = "AIzaSyARzpDJU617VFt8Kzqp9QLtxs1LxuDxFNE";
  const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w45";

const genreMappings: Record<string, string> = {
  "35": "happy", // Comedy
  "18": "sad", // Drama
  "28": "angry", // Action
  "12": "surprised", // Adventure
  "878": "neutral", // Romance
  "9648": "fearful", // Mystery
  "27": "disgusted", // Horror
};

const MovieRecommendation = () => {
  const navigate = useNavigate();
  const { emotionId } = useParams();
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [clickedMovies, setClickedMovies] = useState<number[]>([]);

  const emotion = genreMappings[emotionId || ""];

  useEffect(() => {
    if (!emotionId || !emotion) {
      navigate("/");
      return;
    }

    const token = localStorage.getItem("token");
    const oauthSession = sessionStorage.getItem("oauthSession");

    if (!token && !oauthSession) {
      navigate("/");
      return;
    }

    fetchMovies();
  }, [emotionId, navigate]);

  const fetchMovies = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/discover/movie?with_genres=${emotionId}&watch_region=US`,
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
        const moviesWithProviders = await Promise.all(
          data.results.map(async (movie) => {
            const providerResponse = await fetch(
              `https://api.themoviedb.org/3/movie/${movie.id}/watch/providers`,
              {
                headers: {
                  Authorization: `Bearer ${TMDB_API_KEY}`,
                  "Content-Type": "application/json",
                },
              }
            );
            
            const providerData = await providerResponse.json();
            return {
              ...movie,
              watchProviders: providerData.results?.US // Adjust country code as needed
            };
          })
        );
        setMovies(moviesWithProviders); // Limit to 5 movies
      } else {
        setError("No movies found for this emotion.");
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
      description: "Here are some new movie suggestions based on your mood.",
    });
  };

  const handleSaveToHistory = async () => {
    if (!emotion || clickedMovies.length === 0) return;
    
    try {
      const userEmail = localStorage.getItem('userEmail');
      const selectedMovies = movies.filter(movie => clickedMovies.includes(movie.id));
      
      const response = await fetch('http://localhost:3000/api/auth/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          history: {
            emotion,
            movies: selectedMovies.map(movie => ({
              id: movie.id,
              title: movie.title,
              poster_path: movie.poster_path,
              vote_average: movie.vote_average,
              overview: movie.overview,
              release_date: movie.release_date
            }))
          }
        })
      });

      if (!response.ok) throw new Error('Failed to save history');
      
      toast({
        title: "Saved to history",
        description: "These recommendations have been saved to your history.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const toggleReadMore = (id: number) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const handleMovieClick = async (movieId: number) => {
    if (!clickedMovies.includes(movieId)) {
      
      setClickedMovies([...clickedMovies, movieId]);
    }
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/videos`,
        {
          headers: {
            Authorization: `Bearer ${TMDB_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      const trailer = data.results.find(
        (video: any) => video.type === "Trailer" && video.site === "YouTube"
      );

      if (trailer) {
        const trailerPopup = window.open("", "Trailer", "width=1000,height=600,left=" + (window.innerWidth - 1200) / 2 + ",top=" + (window.innerHeight - 600) / 2);
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
        alert("Trailer not available");
      }
    } catch {
      alert("Failed to fetch trailer");
    }
  };

  const fetchMovieSongs = async (movieTitle: string) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
          `${movieTitle} soundtrack song`
        )}&type=video&maxResults=10&key=${YOUTUBE_API_KEY}`
      );

      const data = await response.json();
      if (data.items?.length > 0) {
        return data.items.map((item: any) => ({
          title: item.snippet.title,
          videoId: item.id.videoId,
        }));
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error fetching songs:", error);
      return [];
    }
  };

  const handleSongsClick = async (movieId: number, movieTitle: string) => {
    const songs = await fetchMovieSongs(movieTitle);
    if (songs.length === 0) {
      alert("No songs found for this movie.");
      return;
    }

    const songsPopup = window.open(
      "",
      "Songs",
      "width=600,height=400,left=" + (window.innerWidth - 600) / 2 + ",top=" + (window.innerHeight - 400) / 2
    );
    songsPopup.document.write(`
      <html>
        <head>
          <title>Songs for ${movieTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; background: #000000; color: white; }
            h2 { text-align: center; color: white; }
            ul { list-style: none; padding: 0; }
            li { display: flex; align-items: center; justify-content: space-between; padding: 10px; background: #1a1a1a; margin-bottom: 5px; border-radius: 5px; color: white; }
            .play-btn { width: 0; height: 0; border-left: 15px solid #00cc00; border-top: 10px solid transparent; border-bottom: 10px solid transparent; cursor: pointer; background: none; }
            .play-btn:hover { border-left-color: #00ff00; }
          </style>
        </head>
        <body>
          <h2>Songs for ${movieTitle}</h2>
          <ul>
            ${songs
              .map(
                (song: any) => `
                  <li>
                    ${song.title}
                    <div class="play-btn" onclick="playSong('${song.videoId}')"></div>
                  </li>
                `
              )
              .join("")}
          </ul>
          <script>
            function playSong(videoId) {
              const songPopup = window.open("", "SongVideo", "width=1000,height=600,left=" + (window.innerWidth - 1200) / 2 + ",top=" + (window.innerHeight - 600) / 2);
              songPopup.document.write(\`
                <html>
                  <body style="margin:0;padding:0;display:flex;justify-content:center;align-items:center;height:100vh;">
                    <iframe
                      width="100%"
                      height="100%"
                      src="https://www.youtube.com/embed/\${videoId}?autoplay=1"
                      frameborder="0"
                      allow="autoplay; encrypted-media"
                      allowfullscreen
                    ></iframe>
                  </body>
                </html>
              \`);
            }
          </script>
        </body>
      </html>
    `);
  };

  const MovieCard = ({ movie }) => (
    <Card className="overflow-hidden rounded-lg shadow-lg transition-transform duration-300 h-full flex flex-col cursor-pointer">
      {movie.poster_path ? (
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
          className="w-full h-80 object-cover"
          loading="lazy"
          onClick={() => handleMovieClick(movie.id)}
        />
      ) : (
        <div className="w-full h-80 bg-muted flex items-center justify-center">
          <span className="text-muted-foreground">No image available</span>
        </div>
      )}
      <CardContent className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">{movie.title}</h2>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => handleSongsClick(movie.id, movie.title)}
          >
            Songs
          </Button>
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
        {movie.watchProviders?.flatrate && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground font-medium mb-1">Available on:</p>
            <div className="flex flex-wrap gap-2">
              {movie.watchProviders.flatrate.length > 0 ? (
                movie.watchProviders.flatrate.map((provider) => (
                  <img
                    key={provider.provider_name}
                    src={`${TMDB_IMAGE_BASE_URL}${provider.logo_path}`}
                    alt={provider.provider_name}
                    title={provider.provider_name} // Tooltip on hover
                    className="h-6 w-6 object-contain rounded"
                  />
                ))
              ) : (
                <span className="text-xs text-muted-foreground">Not available</span>
              )}
            </div>
          </div>
        )}
        <div className="mt-auto flex justify-between items-center">
          <span className="text-sm text-yellow-500 font-medium">
            ⭐ {movie.vote_average.toFixed(1)}
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
              <Link
                to="/emotions"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Emotion detection
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold">
              {`Movies for when you're feeling ${emotion}`}
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

        </div>
      </main>

      <Footer />
    </div>
  );

};

export default MovieRecommendation;
