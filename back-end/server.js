require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// בריאות השרת (Health Check)
app.get('/', (req, res) => res.send('🚀 Status Map Server is Running'));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n--- 🚀 SERVER STARTED ---`);
    console.log(`📍 Network: http://192.168.43.235:${PORT}`);
    console.log(`🔗 Routes: /api/users, /api/posts`);
    console.log(`-------------------------\n`);
});