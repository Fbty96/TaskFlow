const User = require('../models/user');

async function rechercherParEmail(email) {
  return await User.findOne({ email: email.toLowerCase() }).select('nom email');
}

module.exports = { rechercherParEmail };