const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, "Le nom est obligatoire"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "L'email est obligatoire"],
    unique: true,
    trim: true,
    lowercase: true
  },
  motDePasse: {
    type: String,
    required: [true, "Le mot de passe est obligatoire"]
  },
  avatar: {
    type: String,
    default: ""
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);