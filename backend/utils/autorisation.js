const Project = require('../models/project');

async function estMembreDuProjet(projetId, userId) {
  const project = await Project.findById(projetId);
  if (!project) return false;
  const estProprietaire = project.proprietaire.toString() === userId;
  const estMembre = project.membres.some((m) => m.toString() === userId);
  return estProprietaire || estMembre;
}

module.exports = { estMembreDuProjet };