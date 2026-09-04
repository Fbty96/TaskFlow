const mongoose = require('mongoose');

const backlogSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  projet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    unique: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Backlog', backlogSchema);