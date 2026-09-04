const mongoose = require('mongoose');

async function connecterDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connecté à MongoDB Atlas (TaskFlow)');
  } catch (err) {
    console.error('Erreur de connexion MongoDB :', err);
  }
}

module.exports = connecterDB;