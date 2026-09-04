const { getCommentsParTask, creerComment, supprimerComment } = require('../services/commentService');

async function lister(req, res, next) {
  try {
    const comments = await getCommentsParTask(req.params.taskId, req.user.id);
    res.json(comments);
  } catch (err) {
    if (err.message.includes("Accès refusé") || err.message.includes("introuvable")) {
      return res.status(403).json({ message: err.message });
    }
    next(err);
  }
}

async function creer(req, res, next) {
  try {
    const nouveauComment = await creerComment(req.params.taskId, req.body.contenu, req.user.id);
    res.status(201).json(nouveauComment);
  } catch (err) {
    if (err.message.includes("Accès refusé") || err.message.includes("introuvable")) {
      return res.status(403).json({ message: err.message });
    }
    next(err);
  }
}

async function supprimer(req, res, next) {
  try {
    const supprime = await supprimerComment(req.params.id, req.user.id);
    if (!supprime) return res.status(404).json({ message: "Commentaire non trouvé" });
    res.json({ message: "Commentaire supprimé" });
  } catch (err) {
    if (err.message.includes("auteur")) {
      return res.status(403).json({ message: err.message });
    }
    next(err);
  }
}

module.exports = { lister, creer, supprimer };