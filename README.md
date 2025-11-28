# 📽️ Emoflix — Emotion-Based Movie Recommendations

A full-stack application integrating real-time facial emotion detection with personalized movie recommendations using the TMDb API. Built with OpenCV and DeepFace for emotion detection, MongoDB for user data and recommendation history, and a responsive React frontend for seamless user interaction.

## 🌟 Key Features

### 🔐 Authentication
- **Google OAuth:** Seamless social login with JWT token generation.
- **Email/Password Auth:** Traditional authentication with bcrypt hashing and JWT sessions.
- **Session Management:** Persistent login with localStorage for tokens and sessionStorage for OAuth sessions.

### 🎥 Emotion Detection
- **Real-Time Detection:** Uses OpenCV and DeepFace for facial emotion recognition via webcam (80% accuracy).
- **Manual Selection:** Users can manually select emotions if camera access is unavailable.
- **Emotion Mapping:** Maps emotions (happy, sad, angry, etc.) to TMDb genres (e.g., Comedy, Drama).

### 📽️ Movie Recommendations
- **TMDb Integration:** Fetches movie recommendations based on detected or selected emotions using TMDb API.
- **Search Functionality:** Keyword-based movie search with real-time results.
- **Trailer Playback:** Displays YouTube trailers in a popup window.
- **Soundtrack Access:** Fetches and plays movie soundtracks via YouTube API.
- **Provider Info:** Shows streaming availability (e.g., Netflix, Hulu) for movies.
- **History Tracking:** Saves viewed recommendations to user history with MongoDB.

### 📊 User Experience
- **Responsive UI:** Mobile-friendly design with webcam support for emotion detection.
- **Real-Time Feedback:** Toast notifications for actions (login, errors, history updates).
- **History Management:** View, save, and delete recommendation history.
- **Profile Dashboard:** Displays user details and recommendation history.

## 🏗️ Architecture

### Backend (Node.js + Express)
```
emoflix-backend/
├── controllers/ # API logic
│ ├── auth.js # Signup, login, Google OAuth, history management
│ └── emotion.js # Emotion detection, movie recommendations
├── models/ # Mongoose schemas
│ └── User.js # User profiles, recommendation history
├── routes/ # Express routes
│ ├── auth.js # /api/auth endpoints
│ └── emotion.js # /api/emotion endpoints
├── middleware/ # Auth guards, validation
├── utils/ # Helpers (JWT generation, OpenCV/DeepFace integration)
├── server.js # Express app entry point
├── package.json # Node.js dependencies
└── .env # Environment configuration
```

### Frontend (React + TypeScript)
```
emoflix-frontend/
├── src/
│ ├── components/ # Reusable UI (Header, Footer, EmotionCard, MovieCard)
│ ├── pages/ # Routes (Index, Auth, EmotionDetection, MovieRecommendations, Dashboard)
│ ├── hooks/ # Custom hooks (camera access, API queries)
│ ├── services/ # API clients (axios for backend, TMDb/YouTube APIs)
│ ├── utils/ # Helpers (emotion mapping, token handling)
│ ├── App.tsx # Root component with routing
│ └── main.tsx # Vite entry point
├── public/ # Static assets (images, icons)
├── package.json # Node.js dependencies
└── vite.config.ts # Vite build configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Webcam for emotion detection (optional)
- TMDb API key (https://www.themoviedb.org)
- YouTube API key (https://developers.google.com/youtube)
- Google OAuth client ID (https://console.developers.google.com)

### Backend Setup

1. **Clone and navigate to backend:**
   ```bash
   cd emoflix-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```
   
4. **Required environment variables:**
   ```bash
   PORT=5000
   MONGODB_URI="mongodb://localhost:27017/emoflix" # Or Atlas URI
   JWT_SECRET="your_jwt_secret_key" # Generate with openssl rand -hex 32
   GOOGLE_CLIENT_ID="your_google_oauth_client_id"
   TMDB_API_KEY="your_tmdb_api_key"
   YOUTUBE_API_KEY="your_youtube_api_key"
   ```

5. **Run the backend:**
   ```bash
   npm run dev # Nodemon for development
   # or
   npm start # Production
   ```
   The API will be available at http://localhost:5000.

### Frontend Setup

1. **Navigate to frontend:**
   ```bash
   cd emoflix-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Configure environment:**
   ```bash
   cp .env.local.example .env.local
   # Edit with your backend URL and API keys
   ```

4. **Start development server:**
   ```bash
   npm run dev
   # or
   bun dev
   ```
   
The application will be available at http://localhost:5173.

## 🔧 Technology Stack

### Backend
- **Framework:** Express.js (Node.js 18+)
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT, bcryptjs, Google OAuth2
- **Emotion Detection:** OpenCV, DeepFace
- **APIs:** TMDb API, YouTube Data API
- **Security:** Zod validation, crypto (hashing)
- **Utilities:** Axios (HTTP requests)

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **UI Components:** Radix UI + shadcn/ui
- **Styling:** Tailwind CSS + clsx/tailwind-merge
- **State Management:** React Query (TanStack), React Hook Form
- **Routing:** React Router DOM
- **Camera Access:** React Webcam
- **Charts/Other:** Recharts, Framer Motion, Sonner (toasts)

## 🔒 Security Features

### Authentication
1. **JWT Sessions:** 1-hour expiration; bearer token auth for API protection.
2. **Password Hashing:** bcrypt for secure password storage.
3. **OAuth Security:** Google OAuth with token validation and session storage.
4. **Input Validation:** Zod schemas for all requests; prevent injection/XSS.

### Data Protection
- **Emotion Data Privacy:** Temporary storage of image data for processing; no persistent storage.
- **History Storage:** Encrypted user history in MongoDB.
- **Rate Limiting:** Express middleware (add via express-rate-limit for production).

## 📊 API Endpoints

### Authentication
`POST /api/auth/register` - Create account (name/email/password)
`POST /api/auth/login` - Email/password login (returns JWT)
`POST /api/auth/google` - Google OAuth (access token → JWT)
`GET /api/auth/me` - Get user profile (requires JWT)
`POST /api/auth/history` - Save recommendation history
`GET /api/auth/history` - Fetch user history (query ?email=)
`DELETE /api/auth/history/:id` - Delete single history item
`DELETE /api/auth/history` - Clear all history

### Emotion & Recommendations
`POST /api/emotion/detect-emotion` - Process image for emotion detection
`GET /api/emotion/recommendations` - Fetch movies by emotion/genre (query ?genreId=)

🧪 Development

### Running Tests
```bash
# Backend tests (add Jest/Mocha)
cd emoflix-backend
npm test

# Frontend tests (Vite + Vitest)
cd emoflix-frontend
npm run test
```

### Code Quality
```bash
# Backend linting/formatting
npm run lint # ESLint
npm run format # Prettier

# Frontend linting
npm run lint # ESLint + TypeScript
npm run format # Prettier
```

### 🔧 Configuration

### Security Settings
- **JWT Settings:** 1-hour expiry; HS256 algorithm.
- **API Keys:** TMDb and YouTube API keys stored in .env.
- **Rate Limiting:** Add express-rate-limit for endpoints (e.g., 100 req/15min per IP).

### Notification Settings
- **Message Storage:** Array in User model; auto-expire after 30 days (cron job).
- **Thresholds:** Min profile completeness for certain actions.

### 🤝 Contributing
1.Fork the repository
2.Create a feature branch (`git checkout -b feature/new-feature`)
3.Commit changes (`git commit -m 'Add new feature'`)
4.Push to branch (`git push origin feature/new-feature`)
5.Open a Pull Request

## 🆘 Support
For support and questions:
- **Issues:** GitHub Issues tracker
- **Documentation:** `/docs` folder (add API docs with Swagger)
- **API Docs:** `http://localhost:5000/api-docs` (add Swagger middleware)
- **Discord/Slack:** [Link to community] (setup if needed)

## 🔮 Future Enhancements
- **Advanced Emotion Analysis:** Integrate more ML models for nuanced emotions.
- **Personalized Recommendations:** Use user history for ML-based suggestions.
- **Multi-Language Support:** Add internationalization for global users.
- **Mobile Native Apps:** React Native with WalletConnect.
- **Social Sharing:** Share recommendations on social media.
- **Offline Mode:** Cache recommendations for offline access.
- **Zero-Knowledge Proofs:** Enhance privacy for user data.

**Built with ❤️ for mood-based entertainment**
