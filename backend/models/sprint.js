const mongoose = require('mongoose');

const sprintSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true
  },
  objectif: {
    type: String,
    trim: true
  },
  dateDebut: {
    type: Date,
    required: true
  },
  dateFin: {
    type: Date,
    required: true
  },
  statut: {
    type: String,
    enum: ["planifie", "actif", "termine"],
    default: "planifie"
  },
  projet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Sprint', sprintSchema);