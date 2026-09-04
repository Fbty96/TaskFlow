const { rechercherParEmail } = require('../services/userService');

async function rechercher(req, res, next) {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email requis" });

    const user = await rechercherParEmail(email);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { rechercher };