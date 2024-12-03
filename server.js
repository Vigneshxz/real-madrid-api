const express = require('express');
const cors = require('cors');
const Joi = require('joi');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Mock Data
let comments = [];

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static files (optional)
app.use(express.static(path.join(__dirname, 'public')));

// Default route for `/`
app.get('/', (req, res) => {
  res.send('Welcome to the Real Madrid API Server! Use /api/comments to interact with the API.');
});

// API Routes
app.get('/api/comments', (req, res) => {
  res.json(comments);
});

app.post('/api/comments', (req, res) => {
  const { error } = Joi.object({
    comment: Joi.string().allow(null).allow(''),
    image: Joi.string().allow(null).allow(''),
  }).validate(req.body);

  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  const newComment = { id: uuidv4(), ...req.body };
  comments.push(newComment);
  res.json({ success: true, message: 'Comment added successfully!', data: newComment });
});

app.put('/api/comments/:id', (req, res) => {
  const { id } = req.params;
  const { error } = Joi.object({
    comment: Joi.string().allow(null).allow(''),
    image: Joi.string().allow(null).allow(''),
  }).validate(req.body);

  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  const index = comments.findIndex((comment) => comment.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Comment not found.' });
  }

  comments[index] = { ...comments[index], ...req.body };
  res.json({ success: true, message: 'Comment updated successfully!', data: comments[index] });
});

app.delete('/api/comments/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = comments.length;
  comments = comments.filter((comment) => comment.id !== id);

  if (comments.length === initialLength) {
    return res.status(404).json({ success: false, message: 'Comment not found.' });
  }

  res.json({ success: true, message: 'Comment deleted successfully!' });
});

// Fallback route for unmatched paths
app.get('*', (req, res) => {
  res.send('Welcome to the Real Madrid API Server! Use /api/comments to access the API.');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
