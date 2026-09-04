const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  contenu: {
    type: String,
    required: [true, "Le contenu est obligatoire"],
    trim: true
  },
  auteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tache: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);