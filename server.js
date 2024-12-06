const express = require('express');
const path = require('path');
const cors = require('cors');
const Joi = require('joi');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const players = require('./data'); // Import players data

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB Connection
mongoose
  .connect(
    "mongodb+srv://aC6KGkGhiE24fEDs:aC6KGkGhiE24fEDs@cluster0.4wyh5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log('Connected to MongoDB...'))
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1); // Exit process with failure
  });

// Define Comment Schema and Model
const commentSchemaMongoDB = new mongoose.Schema({
  id: { type: String, required: true },
  comment: { type: String, default: null },
  image: { type: String, default: null },
});

const Comment = mongoose.model('Comment', commentSchemaMongoDB);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase payload size limit
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.static('public')); // Serve static files

// Validation Schema for Comments
const commentValidationSchema = Joi.object({
  comment: Joi.string().min(3).allow(null).allow(''), // Allow null or empty string
  image: Joi.string().allow(null).allow(''), // Allow null or empty string
});

// Routes
// Serve players data
app.get('/api/players', (req, res) => {
  res.json(players); // Serve the imported players data
});

// Serve static HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get all comments
app.get('/api/comments', async (req, res) => {
  try {
    const comments = await Comment.find(); // Fetch all comments from MongoDB
    res.json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add a new comment
app.post('/api/comments', async (req, res) => {
  console.log('Incoming request body:', req.body); // Log incoming data

  const { error } = commentValidationSchema.validate(req.body);
  if (error) {
    console.error('Validation error:', error.details[0].message);
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  const newComment = new Comment({
    id: uuidv4(),
    ...req.body,
  });

  try {
    await newComment.save();
    console.log('New comment added:', newComment);
    res.json({ success: true, message: 'Comment added successfully!', data: newComment });
  } catch (err) {
    console.error('Error saving comment:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Edit (update) a comment
app.put('/api/comments/:id', async (req, res) => {
  const { id } = req.params;
  const { comment, image } = req.body;

  const { error } = commentValidationSchema.validate({ comment, image });
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  try {
    const updatedComment = await Comment.findOneAndUpdate(
      { id },
      { comment, image },
      { new: true }
    );

    if (!updatedComment) {
      return res.status(404).json({ success: false, message: 'Comment not found.' });
    }

    console.log(`Comment with ID ${id} updated:`, updatedComment);
    res.json({ success: true, message: 'Comment updated successfully!', data: updatedComment });
  } catch (err) {
    console.error('Error updating comment:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete a comment by ID
app.delete('/api/comments/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedComment = await Comment.findOneAndDelete({ id });
    if (!deletedComment) {
      return res.status(404).json({ success: false, message: 'Comment not found.' });
    }

    console.log(`Comment with ID ${id} deleted.`);
    res.json({ success: true, message: 'Comment deleted successfully!' });
  } catch (err) {
    console.error('Error deleting comment:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
