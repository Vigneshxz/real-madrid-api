const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  comment: { type: String, required: false, minlength: 3 },
  image: { type: String, required: false }, // Base64 string for the image
  createdAt: { type: Date, default: Date.now },
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
