const { inscrire, connecter } = require('../services/authService');
async function register(req, res, next) {
  try {
    const { nom, email, motDePasse } = req.body;
    const nouvelUser = await inscrire(nom, email, motDePasse);
    res.status(201).json({
      message: "Compte créé",
      id: nouvelUser._id,
      nom: nouvelUser.nom,
      email: nouvelUser.email
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, motDePasse } = req.body;
    const resultat = await connecter(email, motDePasse);
    res.json(resultat);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}

module.exports = { register, login };