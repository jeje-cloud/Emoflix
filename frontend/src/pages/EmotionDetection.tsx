import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header, Footer, EmotionCard } from "@/components";
import { EMOTIONS } from "@/lib/constants";
import { Camera, ChevronRight } from "lucide-react";

const TMDB_API_KEY =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlZTJhYTBjODE1NTQzNzkxNjIyMmIxZmYyOWE3ZGI4NiIsIm5iZiI6MTc0MDkyODAzOS41MTIsInN1YiI6IjY3YzQ3NDI3MTExY2RkNGVkOGI0YWUyMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.nmjaNuIPThzM0BrtWckOXBERsIELOoWImWjXHQ9mxqA";
// DeepFace returns: happy, sad, angry, fear, surprise, neutral, disgust
const EMOTION_GENRE_MAP: Record<string, number> = {
  happy: 35, // Comedy
  sad: 18, // Drama
  angry: 28, // Action
  surprise: 27, // Horror (DeepFace returns 'surprise' not 'surprised')
  neutral: 878, // Sci-Fi
  fear: 9648, // Mystery (DeepFace returns 'fear' not 'fearful')
  disgust: 99, // Documentary (DeepFace returns 'disgust' not 'disgusted')
};

// Map DeepFace emotion names to UI emotion names
const DEEPFACE_TO_UI_EMOTION: Record<string, string> = {
  happy: "happy",
  sad: "sad",
  angry: "angry",
  surprise: "surprised",
  neutral: "neutral",
  fear: "fearful",
  disgust: "disgusted",
};

// Map UI emotion names to DeepFace emotion names (for genre lookup)
const UI_TO_DEEPFACE_EMOTION: Record<string, string> = {
  happy: "happy",
  sad: "sad",
  angry: "angry",
  surprised: "surprise",
  neutral: "neutral",
  fearful: "fear",
  disgusted: "disgust",
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
        // Check if video has valid dimensions
        const videoWidth = videoRef.current.videoWidth;
        const videoHeight = videoRef.current.videoHeight;
        
        if (videoWidth === 0 || videoHeight === 0) {
          console.error("Video not ready yet - dimensions are 0");
          return null;
        }
        
        // Set canvas dimensions to match video
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;
        
        context.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
        return canvasRef.current.toDataURL("image/jpeg", 0.9);
      }
    }
    console.error("Video or canvas ref not available");
    return null;
  };

  // Capture multiple frames for better accuracy
  const captureMultipleFrames = async (stream: MediaStream) => {
    const frames: string[] = [];
    const numFrames = 3; // Capture 3 frames for faster processing
    const intervalMs = 500; // 500ms between frames (1.5 seconds total)
    
    for (let i = 0; i < numFrames; i++) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));
      const frame = captureImage();
      if (frame) {
        frames.push(frame);
        console.log(`Captured frame ${i + 1}/${numFrames}`);
      }
    }
    
    stream.getTracks().forEach((track) => track.stop());
    return frames;
  };

  const sendMultipleImagesToServer = async (images: string[]) => {
    try {
      console.log(`Sending ${images.length} images to emotion detection API...`);
      const response = await fetch("http://localhost:5000/detect-emotion-multi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images }),
      });
      const data = await response.json();
      console.log("API Response:", data);
      
      if (data.error) {
        console.error("Emotion detection error:", data.error);
        // Fallback to single image detection
        if (images.length > 0) {
          await sendImageToServer(images[images.length - 1]);
          return;
        }
        alert("Could not detect emotion. Please try again with better lighting and face the camera directly.");
      } else if (data.emotion) {
        // Convert DeepFace emotion to UI emotion name
        const uiEmotion = DEEPFACE_TO_UI_EMOTION[data.emotion] || data.emotion;
        console.log("Detected emotion:", data.emotion, "-> UI emotion:", uiEmotion);
        console.log("Votes:", data.votes);
        setSelectedEmotion(uiEmotion);
        fetchMovies(data.emotion); // Use original DeepFace emotion for genre lookup
      }
    } catch (error) {
      console.error("Error detecting emotion:", error);
      alert("Failed to connect to emotion detection server. Make sure the Python server is running on port 5000.");
    } finally {
      setIsUsingCamera(false);
      setIsLoading(false);
    }
  };

  const sendImageToServer = async (imageData: string) => {
    try {
      console.log("Sending image to emotion detection API...");
      const response = await fetch("http://localhost:5000/detect-emotion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }),
      });
      const data = await response.json();
      console.log("API Response:", data);
      
      if (data.error) {
        console.error("Emotion detection error:", data.error);
        alert("Could not detect emotion. Please try again with better lighting and face the camera directly.");
      } else if (data.emotion) {
        // Convert DeepFace emotion to UI emotion name
        const uiEmotion = DEEPFACE_TO_UI_EMOTION[data.emotion] || data.emotion;
        console.log("Detected emotion:", data.emotion, "-> UI emotion:", uiEmotion);
        setSelectedEmotion(uiEmotion);
        fetchMovies(data.emotion); // Use original DeepFace emotion for genre lookup
      }
    } catch (error) {
      console.error("Error detecting emotion:", error);
      alert("Failed to connect to emotion detection server. Make sure the Python server is running on port 5000.");
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
        // Wait for video to actually start playing before capturing
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
      }
      // Wait for video to stabilize, then capture multiple frames
      setTimeout(async () => {
        console.log("Starting multi-frame capture for better accuracy...");
        const frames = await captureMultipleFrames(stream);
        if (frames.length > 0) {
          await sendMultipleImagesToServer(frames);
        } else {
          alert("Could not capture any frames. Please try again.");
          setIsUsingCamera(false);
          setIsLoading(false);
        }
      }, 2000); // 2 second initial delay, then 2 more seconds for 5 frame captures
    } catch (error) {
      console.error("Error accessing camera:", error);
      setIsUsingCamera(false);
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (selectedEmotion) {
      // Convert UI emotion to DeepFace emotion for genre lookup
      const deepfaceEmotion = UI_TO_DEEPFACE_EMOTION[selectedEmotion] || selectedEmotion;
      const emotionId = EMOTION_GENRE_MAP[deepfaceEmotion]; // Get the corresponding emotionId
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
