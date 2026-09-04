const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

async function inscrire(nom, email, motDePasse) {
  const motDePasseChiffre = await bcrypt.hash(motDePasse, 10);
  const nouvelUser = new User({ nom, email, motDePasse: motDePasseChiffre });
  return await nouvelUser.save();
}

async function connecter(email, motDePasse) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Email ou mot de passe incorrect");
  }

  const motDePasseValide = await bcrypt.compare(motDePasse, user.motDePasse);
  if (!motDePasseValide) {
    throw new Error("Email ou mot de passe incorrect");
  }

  const token = jwt.sign(
    { id: user._id, email: user.email, nom: user.nom },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return { token, user: { id: user._id, nom: user.nom, email: user.email } };
}

module.exports = { inscrire, connecter };