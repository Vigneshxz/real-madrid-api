const express = require('express');
const path = require('path');
const cors = require('cors');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Mock Data
const players = require('./data'); // Example player data
let comments = [];

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase payload size limit
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.static('public'));

// Validation Schema for Comments
const commentSchema = Joi.object({
  comment: Joi.string().min(3).allow(null).allow(''), // Allow null or empty string
  image: Joi.string().allow(null).allow(''), // Allow null or empty string
});

// Routes
// Serve players data
app.get('/api/players', (req, res) => {
  res.json(players);
});

// Serve static HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get all comments
app.get('/api/comments', (req, res) => {
  res.json(comments);
});

// Add a new comment
app.post('/api/comments', (req, res) => {
  console.log("Incoming request body:", req.body); // Log incoming data

  const { error } = commentSchema.validate(req.body);
  if (error) {
    console.error("Validation error:", error.details[0].message);
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  const newComment = { id: uuidv4(), ...req.body };
  comments.push(newComment);
  console.log("New comment added:", newComment);
  res.json({ success: true, message: 'Comment added successfully!' });
});

// Edit (update) a comment
app.put('/api/comments/:id', (req, res) => {
  const { id } = req.params;
  const { comment, image } = req.body;

  // Validate the updated data
  const { error } = commentSchema.validate({ comment, image });
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  // Find the comment by ID and update it
  const commentIndex = comments.findIndex((c) => c.id === id);
  if (commentIndex === -1) {
    return res.status(404).json({ success: false, message: 'Comment not found.' });
  }

  comments[commentIndex] = { ...comments[commentIndex], comment, image };
  console.log(`Comment with ID ${id} updated:`, comments[commentIndex]);
  res.json({ success: true, message: 'Comment updated successfully!' });
});

// Delete a comment by ID
app.delete('/api/comments/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = comments.length;
  comments = comments.filter((comment) => comment.id !== id);

  if (comments.length === initialLength) {
    return res.status(404).json({ success: false, message: 'Comment not found.' });
  }

  console.log(`Comment with ID ${id} deleted.`);
  res.json({ success: true, message: 'Comment deleted successfully!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
