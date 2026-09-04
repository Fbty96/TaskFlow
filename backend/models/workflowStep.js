const mongoose = require('mongoose');

const workflowStepSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true
  },
  ordre: {
    type: Number,
    required: true
  },
  couleur: {
    type: String,
    default: "#CCCCCC"
  },
  workflow: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('WorkflowStep', workflowStepSchema);