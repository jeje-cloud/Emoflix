import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header, Footer, EmotionCard } from "@/components";
import { EMOTIONS } from "@/lib/constants";
import { Camera, ChevronRight } from "lucide-react";

const TMDB_API_KEY =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlZTJhYTBjODE1NTQzNzkxNjIyMmIxZmYyOWE3ZGI4NiIsIm5iZiI6MTc0MDkyODAzOS41MTIsInN1YiI6IjY3YzQ3NDI3MTExY2RkNGVkOGI0YWUyMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.nmjaNuIPThzM0BrtWckOXBERsIELOoWImWjXHQ9mxqA";
const EMOTION_GENRE_MAP: Record<string, number> = {
  happy: 35, // Comedy
  sad: 18, // Drama
  angry: 28, // Action
  surprised: 27, // Horror
  neutral: 878, // Romance
  fearful: 9648, // Mystery
  disgusted: 99, // Documentary
};

const EmotionDetection = () => {
  const navigate = useNavigate();
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [isUsingCamera, setIsUsingCamera] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = urlParams.get("access_token");

    if (accessToken) {
      localStorage.setItem("token", accessToken);
      sessionStorage.setItem("oauthSession", "true");
      window.history.replaceState({}, document.title, "/emotions");
    }

    const token = localStorage.getItem("token");
    const oauthSession = sessionStorage.getItem("oauthSession");

    if (!token && !oauthSession) {
      navigate("/");
    }
  }, [navigate]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        context.drawImage(videoRef.current, 0, 0, 640, 480);
        const imageData = canvasRef.current.toDataURL("image/jpeg");
        sendImageToServer(imageData);
      }
    }
  };

  const sendImageToServer = async (imageData: string) => {
    try {
      const response = await fetch("http://localhost:5000/detect-emotion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }),
      });
      const data = await response.json();
      if (data.emotion) {
        setSelectedEmotion(data.emotion);
        fetchMovies(data.emotion);
      }
    } catch (error) {
      console.error("Error detecting emotion:", error);
    } finally {
      setIsUsingCamera(false);
      setIsLoading(false);
    }
  };

  const fetchMovies = async (emotion: string) => {
    const genreId = EMOTION_GENRE_MAP[emotion] || 35; // Default to Comedy
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/discover/movie?with_genres=${genreId}&sort_by=popularity.desc&api_key=${TMDB_API_KEY}`
      );

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setRecommendedMovies(data.results.slice(0, 5));
      } else {
        console.error("No movies found for this emotion.");
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  };

  const handleAutoDetect = async () => {
    setIsUsingCamera(true);
    setIsLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setTimeout(() => {
        captureImage();
        stream.getTracks().forEach((track) => track.stop());
      }, 3000);
    } catch (error) {
      console.error("Error accessing camera:", error);
      setIsUsingCamera(false);
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (selectedEmotion) {
      const emotionId = EMOTION_GENRE_MAP[selectedEmotion]; // Get the corresponding emotionId
      navigate(`/recommendations/${emotionId}`, {
        state: { emotion: selectedEmotion, emotionId: emotionId },
      });
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">How are you feeling today?</h1>
          <p className="text-lg text-muted-foreground">
            Select your emotion or let us detect it for you, and we'll recommend movies that match your mood.
          </p>

          {!isUsingCamera && (
            <Button onClick={handleAutoDetect} variant="outline" className="mt-6 gap-2">
              <Camera className="h-4 w-4" /> Auto-detect my mood
            </Button>
          )}
          {isUsingCamera && (
            <div className="mt-6">
              <p className="text-muted-foreground mb-2">Detecting your emotion...</p>
              <video ref={videoRef} autoPlay className="w-64 h-64 bg-muted rounded-lg mx-auto" />
              <canvas ref={canvasRef} className="hidden" width="640" height="480" />
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            {Object.values(EMOTIONS).map((emotion) => (
              <EmotionCard
                key={emotion.id}
                emotion={emotion}
                onSelect={() => setSelectedEmotion(emotion.id)}
                isSelected={selectedEmotion === emotion.id}
              />
            ))}
          </div>

          <Button onClick={handleContinue} disabled={!selectedEmotion} size="lg" className="mt-6">
            Continue <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EmotionDetection;
