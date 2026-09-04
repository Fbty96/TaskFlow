const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
  nom: {
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

module.exports = mongoose.model('Workflow', workflowSchema);