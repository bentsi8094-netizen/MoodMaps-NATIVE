


require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const aiRoutes = require('./routes/aiRoutes'); // הוספה

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/ai', aiRoutes); // חיבור ה-Route החדש

app.get('/', (req, res) => res.send('🚀 Status Map Server is Running with AI Agent'));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n--- 🚀 SERVER STARTED ---`);
    console.log(`📍 AI Enabled: GPT-4o-mini + DALL-E 3`);
    console.log(`-------------------------\n`);
});