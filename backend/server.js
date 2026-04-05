const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const emotionRoutes = require('./routes/emotionRoutes');
dotenv.config();

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Connect DB
connectDB();

// CORS configuration (production-safe)
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/emotion', emotionRoutes);

// Health check route
app.get('/', (req, res) => {
    res.json({
        status: 'Backend is running',
        service: 'EmoFlix API'
    });
});

// Port (Render-compatible)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
