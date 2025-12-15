const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const uploadRoute = require('./routes/upload');
const aiRoute = require('./routes/ai');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for frontend
app.use(express.json({ limit: '50mb' })); // Increase limit for Base64 images
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/upload', uploadRoute);
app.use('/api/ai', aiRoute);

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
