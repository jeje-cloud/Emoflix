from flask import Flask, request, jsonify
import cv2
import numpy as np
import base64
from deepface import DeepFace
import requests
from flask_cors import CORS  # Import Flask-CORS
from collections import Counter

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

TMDB_API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlZTJhYTBjODE1NTQzNzkxNjIyMmIxZmYyOWE3ZGI4NiIsIm5iZiI6MTc0MDkyODAzOS41MTIsInN1YiI6IjY3YzQ3NDI3MTExY2RkNGVkOGI0YWUyMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.nmjaNuIPThzM0BrtWckOXBERsIELOoWImWjXHQ9mxqA"

# Emotion-to-genre mapping
GENRE_MAP = {
    "happy": 35,      # Comedy
    "sad": 18,        # Drama
    "angry": 28,      # Action
    "fear": 27,       # Horror
    "surprise": 878,  # Sci-Fi
    "neutral": 10749  # Romance
}

def preprocess_image(image):
    """Preprocess image for better emotion detection"""
    # Convert to RGB if needed (DeepFace expects RGB)
    if len(image.shape) == 2:
        image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
    elif image.shape[2] == 4:
        image = cv2.cvtColor(image, cv2.COLOR_BGRA2RGB)
    else:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    # Enhance contrast using CLAHE
    lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    lab = cv2.merge((l, a, b))
    image = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
    
    return image

def analyze_single_image(image):
    """Analyze a single image and return emotion scores"""
    processed_image = preprocess_image(image)
    
    try:
        # Use opencv for faster face detection
        analysis = DeepFace.analyze(
            processed_image, 
            actions=["emotion"], 
            enforce_detection=True,
            detector_backend='opencv'
        )
    except:
        # Fallback to no face detection enforcement
        analysis = DeepFace.analyze(
            processed_image, 
            actions=["emotion"], 
            enforce_detection=False
        )
    
    return analysis[0]["emotion"], analysis[0]["dominant_emotion"]

@app.route("/detect-emotion", methods=["POST"])
def detect_emotion():
    try:
        data = request.json["image"].split(",")[1]
        image_bytes = base64.b64decode(data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Analyze the image
        emotion_scores, dominant_emotion = analyze_single_image(image)
        
        print(f"Detected emotion: {dominant_emotion}")
        print(f"All scores: {emotion_scores}")
        
        # Convert numpy float32 to Python float for JSON serialization
        emotion_scores_json = {k: float(v) for k, v in emotion_scores.items()}
        
        # Find the emotion with highest confidence (excluding neutral if others are significant)
        sorted_emotions = sorted(emotion_scores_json.items(), key=lambda x: x[1], reverse=True)
        
        # If neutral is detected but has less than 50% confidence and another emotion has > 20%
        # use the second highest emotion for better UX
        final_emotion = dominant_emotion
        if dominant_emotion == "neutral" and emotion_scores_json["neutral"] < 50:
            for emo, score in sorted_emotions:
                if emo != "neutral" and score > 20:
                    final_emotion = emo
                    print(f"Overriding neutral with {emo} (score: {score}%)")
                    break
        
        return jsonify({
            "emotion": final_emotion,
            "scores": emotion_scores_json
        })
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)})

# New endpoint for multiple frame analysis (more accurate)
@app.route("/detect-emotion-multi", methods=["POST"])
def detect_emotion_multi():
    try:
        images_data = request.json.get("images", [])
        
        if not images_data:
            return jsonify({"error": "No images provided"})
        
        all_emotions = []
        aggregated_scores = {"angry": 0, "disgust": 0, "fear": 0, "happy": 0, "sad": 0, "surprise": 0, "neutral": 0}
        successful_analyses = 0
        
        for img_data in images_data:
            try:
                data = img_data.split(",")[1]
                image_bytes = base64.b64decode(data)
                nparr = np.frombuffer(image_bytes, np.uint8)
                image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                emotion_scores, dominant_emotion = analyze_single_image(image)
                all_emotions.append(dominant_emotion)
                
                for emo, score in emotion_scores.items():
                    aggregated_scores[emo] += float(score)
                
                successful_analyses += 1
            except Exception as e:
                print(f"Error analyzing frame: {e}")
                continue
        
        if successful_analyses == 0:
            return jsonify({"error": "Could not analyze any frames"})
        
        # Average the scores
        for emo in aggregated_scores:
            aggregated_scores[emo] /= successful_analyses
        
        # Use majority voting for final emotion
        emotion_counts = Counter(all_emotions)
        majority_emotion = emotion_counts.most_common(1)[0][0]
        
        # Or use the highest average score
        highest_avg_emotion = max(aggregated_scores.items(), key=lambda x: x[1])[0]
        
        print(f"Majority vote: {majority_emotion}, Highest avg: {highest_avg_emotion}")
        print(f"Emotion counts: {emotion_counts}")
        print(f"Average scores: {aggregated_scores}")
        
        # Prefer majority vote, but use highest average if neutral wins majority but another emotion has higher average
        final_emotion = majority_emotion
        if majority_emotion == "neutral" and highest_avg_emotion != "neutral" and aggregated_scores[highest_avg_emotion] > 30:
            final_emotion = highest_avg_emotion
        
        return jsonify({
            "emotion": final_emotion,
            "scores": aggregated_scores,
            "votes": dict(emotion_counts)
        })
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)})
    
@app.route("/", methods=["GET"])
def health():
    return {
        "status": "AI service is running",
        "service": "DeepFace + OpenCV",
    }, 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)


