import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { EMOTIONS } from "@/lib/constants";
import { Calendar, Clock } from "lucide-react";

const TMDB_API_KEY =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlZTJhYTBjODE1NTQzNzkxNjIyMmIxZmYyOWE3ZGI4NiIsIm5iZiI6MTc0MDkyODAzOS41MTIsInN1YiI6IjY3YzQ3NDI3MTExY2RkNGVkOGI0YWUyMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.nmjaNuIPThzM0BrtWckOXBERsIELOoWImWjXHQ9mxqA";

interface HistoryItemProps {
  history: {
    _id: string;
    emotion: string; // For recommendation history: emotion, for search history: query
    movies: Array<{
      id: number;
      title: string;
      poster_path?: string;
      vote_average: number;
      overview: string;
      release_date: string;
    }>;
    timestamp: string;
  };
}

const HistoryItem = ({ history }: HistoryItemProps) => {
  console.log(history);
  const date = new Date(history.timestamp);
  
  // If the date is invalid, log a warning but still use the original date
  if (isNaN(date.getTime())) {
    console.warn("Invalid date received:", history.timestamp);
  }

  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Determine if this is a search history item (no movies) or recommendation history
  const isSearchHistory = history.movies.length === 0;
  const displayLabel = isSearchHistory ? "Search Query" : history.emotion;
  const emotion = isSearchHistory ? null : EMOTIONS[history.emotion];

  const handleMovieClick = async (movieId: number) => {
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
        const trailerPopup = window.open(
          "",
          "Trailer",
          "width=1000,height=600,left=" +
            (window.innerWidth - 1200) / 2 +
            ",top=" +
            (window.innerHeight - 600) / 2
        );
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

  return (
    <Accordion type="single" collapsible className="w-full rounded-lg glass-panel">
      <AccordionItem value={history._id} className="border-none">
        <AccordionTrigger className="py-5 px-6 hover:no-underline">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-left">
            <Badge
              className={`bg-gradient-to-r ${
                isSearchHistory ? "from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800" : emotion?.color
              } hover:${isSearchHistory ? "from-blue-600 hover:to-blue-800" : emotion?.color}`}
            >
              {isSearchHistory ? displayLabel : history.emotion}
            </Badge>
            <div className="flex flex-col sm:flex-row gap-1 sm:gap-6">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1.5" />
                {formattedDate}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-3 w-3 mr-1.5" />
                {formattedTime}
              </div>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-6 px-6">
          {isSearchHistory ? (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">
                Searched for: <span className="font-medium">{history.emotion}</span>
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
              {history.movies.map((movie) => (
                <div
                  key={movie.id}
                  className="border rounded-lg p-3 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleMovieClick(movie.id)}
                >
                  {movie.poster_path && (
                    <img
                      src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-40 object-cover rounded mb-2"
                    />
                  )}
                  <h3 className="font-medium">{movie.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {movie.release_date?.substring(0, 4)} • ⭐{" "}
                    {movie.vote_average?.toFixed(1)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default HistoryItem;