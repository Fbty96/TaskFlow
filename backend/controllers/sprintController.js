const { getSprintsParProjet, creerSprint, modifierSprint, supprimerSprint } = require('../services/sprintService');

async function lister(req, res, next) {
  try {
    const sprints = await getSprintsParProjet(req.params.projetId, req.user.id);
    res.json(sprints);
  } catch (err) {
    if (err.message.includes("Accès refusé")) {
      return res.status(403).json({ message: err.message });
    }
    next(err);
  }
}

async function creer(req, res, next) {
  try {
    const nouveauSprint = await creerSprint(req.params.projetId, req.body, req.user.id);
    res.status(201).json(nouveauSprint);
  } catch (err) {
    if (err.message.includes("propriétaire") || err.message.includes("introuvable")) {
      return res.status(403).json({ message: err.message });
    }
    next(err);
  }
}

async function modifier(req, res, next) {
  try {
    const sprint = await modifierSprint(req.params.id, req.user.id, req.body);
    if (!sprint) return res.status(404).json({ message: "Sprint non trouvé" });
    res.json(sprint);
  } catch (err) {
    if (err.message.includes("propriétaire")) {
      return res.status(403).json({ message: err.message });
    }
    next(err);
  }
}

async function supprimer(req, res, next) {
  try {
    const supprime = await supprimerSprint(req.params.id, req.user.id);
    if (!supprime) return res.status(404).json({ message: "Sprint non trouvé" });
    res.json({ message: "Sprint supprimé" });
  } catch (err) {
    if (err.message.includes("propriétaire")) {
      return res.status(403).json({ message: err.message });
    }
    next(err);
  }
}

module.exports = { lister, creer, modifier, supprimer };