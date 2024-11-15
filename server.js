const express = require('express');
const path = require('path');
const cors = require('cors'); 
const players = require('./data');

const app = express();
const PORT = process.env.PORT || 3001;


app.use(cors());

// Serve static files (images and CSS)
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.static('public'));


app.get('/api/players', (req, res) => {
  res.json(players);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
