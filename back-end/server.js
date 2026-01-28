require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// חיבור ה-Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server is running on http://192.168.43.235:${PORT}`);
    console.log(`🚀 Routes connected: /api/users and /api/posts`);
});