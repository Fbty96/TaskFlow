const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  destinataire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  tache: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  lu: {
    type: Boolean,
    default: false
  },
  dateEnvoi: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema);