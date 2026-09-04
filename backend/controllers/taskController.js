const {
  getTasksParBacklog, creerTask, modifierTask, changerStatut,
  assignerSprint, assignerUtilisateur, retirerAssignation, supprimerTask, getMesTaches
} = require('../services/taskService');
const Backlog = require('../models/backlog');
const { notifierProjet } = require('../services/sseService');

async function lister(req, res, next) {
  try {
    const tasks = await getTasksParBacklog(req.params.backlogId, req.user.id);
    res.json(tasks);
  } catch (err) {
    if (err.message.includes("Accès refusé") || err.message.includes("introuvable")) {
      return res.status(403).json({ message: err.message });
    }
    next(err);
  }
}

async function creer(req, res, next) {
  try {
    const nouvelleTask = await creerTask(req.params.backlogId, req.body, req.user.id);
    res.status(201).json(nouvelleTask);
  } catch (err) {
    if (err.message.includes("Accès refusé") || err.message.includes("introuvable")) {
      return res.status(403).json({ message: err.message });
    }
    next(err);
  }
}

async function modifier(req, res, next) {
  try {
    const task = await modifierTask(req.params.id, req.user.id, req.body);
    if (!task) return res.status(404).json({ message: "Tâche non trouvée" });
    res.json(task);
  } catch (err) {
    if (err.message.includes("Accès refusé")) {
      return res.status(403).json({ message: err.message });
    }
    next(err);
  }
}

async function changerStatutController(req, res, next) {
  try {
    const task = await changerStatut(req.params.id, req.user.id, req.body.statutId);
    if (!task) return res.status(404).json({ message: "Tâche non trouvée" });

    const backlog = await Backlog.findById(task.backlog);
    notifierProjet(backlog.projet.toString(), { type: 'tache-mise-a-jour' });

    res.json(task);
  } catch (err) {
    if (err.message.includes("Accès refusé") || err.message.includes("workflow")) {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
}

async function assignerSprintController(req, res, next) {
  try {
    const task = await assignerSprint(req.params.id, req.user.id, req.body.sprintId);
    if (!task) return res.status(404).json({ message: "Tâche non trouvée" });
    res.json(task);
  } catch (err) {
    if (err.message.includes("Accès refusé")) {
      return res.status(403).json({ message: err.message });
    }
    next(err);
  }
}

async function assignerUtilisateurController(req, res, next) {
  try {
    const task = await assignerUtilisateur(req.params.id, req.user.id, req.body.utilisateurId);
    if (!task) return res.status(404).json({ message: "Tâche non trouvée" });
    res.json(task);
  } catch (err) {
    if (err.message.includes("Accès refusé")) {
      return res.status(403).json({ message: err.message });
    }
    next(err);
  }
}

async function retirerAssignationController(req, res, next) {
  try {
    const resultat = await retirerAssignation(req.params.id, req.user.id);
    if (!resultat) return res.status(404).json({ message: "Tâche non trouvée" });
    res.json({ message: "Assignation retirée" });
  } catch (err) {
    if (err.message.includes("Accès refusé")) {
      return res.status(403).json({ message: err.message });
    }
    next(err);
  }
}

async function supprimer(req, res, next) {
  try {
    const supprime = await supprimerTask(req.params.id, req.user.id);
    if (!supprime) return res.status(404).json({ message: "Tâche non trouvée" });
    res.json({ message: "Tâche supprimée" });
  } catch (err) {
    if (err.message.includes("propriétaire")) {
      return res.status(403).json({ message: err.message });
    }
    next(err);
  }
}

async function mesTaches(req, res, next) {
  try {
    const taches = await getMesTaches(req.user.id);
    res.json(taches);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  lister, creer, modifier, changerStatutController,
  assignerSprintController, assignerUtilisateurController,
  retirerAssignationController, supprimer, mesTaches
};