const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Load data from the JSON file
const musicDataPath = path.join(__dirname, 'data.json');
let musicCatalog = [];
try {
    const data = fs.readFileSync(musicDataPath, 'utf8');
    musicCatalog = JSON.parse(data);
    console.log(`Loaded ${musicCatalog.length} songs from data.json.`);
} catch (error) {
    console.error('Error loading music data:', error.message);
}

// ----------------------------------------------------
// Middleware
// ----------------------------------------------------

// Allow all origins (essential for Chrome Extension access)
app.use(cors()); 

// ----------------------------------------------------
// API Endpoint
// ----------------------------------------------------

// Endpoint to get a random song based on topic
app.get('/api/music', (req, res) => {
    const randomIndex = Math.floor(Math.random() * musicCatalog.length);
    const selectedSong = musicCatalog[randomIndex];
    console.log(`\nTesting Example: http://localhost:${PORT}/api/music`);

    res.json(selectedSong);
});

// ----------------------------------------------------
// Server Start
// ----------------------------------------------------

app.listen(PORT, () => {
    console.log(`\n🎉 Music API Server running on http://localhost:${PORT}`);
    console.log(`\nTesting Example: http://localhost:${PORT}/api/music`);
});