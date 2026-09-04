const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, "Le titre est obligatoire"],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  priorite: {
    type: Number,
    required: true,
    min: [1, "La priorité minimale est 1"],
    default: 1
  },
  echeance: {
    type: Date
  },
  dureeEstimee: {
    type: Number
  },
  backlog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Backlog',
    required: true
  },
  sprint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sprint',
    default: null
  },
  statutActuel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkflowStep',
    required: true
  },
  assigneA: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  default: null
  }
}, { timestamps: true });

taskSchema.index({ backlog: 1 });
taskSchema.index({ assigneA: 1 });

module.exports = mongoose.model('Task', taskSchema);