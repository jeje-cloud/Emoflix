const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();
app.use(express.json());
app.use(bodyParser.json());

// Connect DB
connectDB();

// CORS configuration (production-safe)
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
}));

// Routes
app.use('/api/auth', authRoutes);

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
