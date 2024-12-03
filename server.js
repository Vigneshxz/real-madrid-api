const express = require('express');
const cors = require('cors');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Mock Data
let comments = []; // Array to store comments

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Validation Schema for Adding/Editing Comments
const commentSchema = Joi.object({
  comment: Joi.string().allow(null).allow(''), // Allow empty or null comments
  image: Joi.string().allow(null).allow(''), // Allow empty or null images
});

// Get all comments
app.get('/api/comments', (req, res) => {
  res.json(comments);
});

// Add a new comment
app.post('/api/comments', (req, res) => {
  const { error } = commentSchema.validate(req.body);

  if (error) {
    console.error("Validation error (POST):", error.details[0].message);
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const newComment = { id: uuidv4(), ...req.body };
  comments.push(newComment);

  console.log("New comment added:", newComment);
  res.json({ success: true, message: 'Comment added successfully!', data: newComment });
});

// Edit a comment
app.put('/api/comments/:id', (req, res) => {
  const { id } = req.params;
  const { error } = commentSchema.validate(req.body);

  if (error) {
    console.error("Validation error (PUT):", error.details[0].message);
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const commentIndex = comments.findIndex((comment) => comment.id === id);

  if (commentIndex === -1) {
    console.error("Comment not found:", id);
    return res
      .status(404)
      .json({ success: false, message: 'Comment not found.' });
  }

  comments[commentIndex] = {
    ...comments[commentIndex],
    ...req.body, // Update only the fields provided in the request
  };

  console.log("Comment updated:", comments[commentIndex]);
  res.json({
    success: true,
    message: 'Comment updated successfully!',
    data: comments[commentIndex],
  });
});

// Delete a comment
app.delete('/api/comments/:id', (req, res) => {
  const { id } = req.params;

  const initialLength = comments.length;
  comments = comments.filter((comment) => comment.id !== id);

  if (comments.length === initialLength) {
    console.error("Comment not found (DELETE):", id);
    return res
      .status(404)
      .json({ success: false, message: 'Comment not found.' });
  }

  console.log(`Comment with ID ${id} deleted.`);
  res.json({ success: true, message: 'Comment deleted successfully!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
