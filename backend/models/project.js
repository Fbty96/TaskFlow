const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, "Le titre est obligatoire"],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  proprietaire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  membres: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

projectSchema.index({ proprietaire: 1 });
projectSchema.index({ membres: 1 });

module.exports = mongoose.model('Project', projectSchema);