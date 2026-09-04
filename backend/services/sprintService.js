const Sprint = require('../models/sprint');
const Project = require('../models/project');
const { estMembreDuProjet } = require('../utils/autorisation');

async function getSprintsParProjet(projetId, userId) {
  const autorise = await estMembreDuProjet(projetId, userId);
  if (!autorise) throw new Error("Accès refusé à ce projet");
  return await Sprint.find({ projet: projetId }).sort({ dateDebut: 1 });
}

async function creerSprint(projetId, donnees, userId) {
  const project = await Project.findById(projetId);
  if (!project) throw new Error("Projet introuvable");
  if (project.proprietaire.toString() !== userId) {
    throw new Error("Seul le propriétaire peut créer un sprint");
  }
  const nouveauSprint = new Sprint({ ...donnees, projet: projetId });
  return await nouveauSprint.save();
}

async function modifierSprint(id, userId, nouvellesDonnees) {
  const sprint = await Sprint.findById(id);
  if (!sprint) return null;

  const project = await Project.findById(sprint.projet);
  if (project.proprietaire.toString() !== userId) {
    throw new Error("Seul le propriétaire peut modifier ce sprint");
  }

  Object.assign(sprint, nouvellesDonnees);
  return await sprint.save();
}

async function supprimerSprint(id, userId) {
  const sprint = await Sprint.findById(id);
  if (!sprint) return false;

  const project = await Project.findById(sprint.projet);
  if (project.proprietaire.toString() !== userId) {
    throw new Error("Seul le propriétaire peut supprimer ce sprint");
  }

  await Sprint.findByIdAndDelete(id);
  return true;
}

module.exports = { getSprintsParProjet, creerSprint, modifierSprint, supprimerSprint };