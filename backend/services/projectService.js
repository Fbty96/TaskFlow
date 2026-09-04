const Project = require('../models/project');
const { creerBacklog } = require('./backlogService');
const { creerWorkflowParDefaut } = require('./workflowService');
const Backlog = require('../models/backlog');

async function getProjects(userId) {
  const projects = await Project.find({
    $or: [{ proprietaire: userId }, { membres: userId }]
  }).populate('proprietaire', 'nom email').populate('membres', 'nom email');

  const projectsAvecBacklog = await Promise.all(
    projects.map(async (project) => {
      const backlog = await Backlog.findOne({ projet: project._id });
      return { ...project.toObject(), backlog: backlog?._id };
    })
  );

  return projectsAvecBacklog;
}

async function getProjectParId(id) {
  const project = await Project.findById(id)
    .populate('proprietaire', 'nom email')
    .populate('membres', 'nom email')
    .lean();

  if (!project) return null;

  const backlog = await Backlog.findOne({ projet: project._id });
  return { ...project, backlog: backlog?._id };
}

async function creerProject(titre, description, proprietaireId) {
  const nouveauProject = new Project({ titre, description, proprietaire: proprietaireId, membres: [] });
  await nouveauProject.save();

  const backlog = await creerBacklog(nouveauProject._id, titre);
  const { workflow, etapes } = await creerWorkflowParDefaut(nouveauProject._id, titre);

  return { project: nouveauProject, backlog, workflow, etapes };
}

async function modifierProject(id, userId, nouvellesDonnees) {
  const project = await Project.findById(id);
  if (!project) return null;

  if (project.proprietaire.toString() !== userId) {
    throw new Error("Seul le propriétaire peut modifier ce projet");
  }

  Object.assign(project, nouvellesDonnees);
  return await project.save();
}

async function ajouterMembre(projectId, userId, membreId) {
  const project = await Project.findById(projectId);
  if (!project) return null;

  if (project.proprietaire.toString() !== userId) {
    throw new Error("Seul le propriétaire peut ajouter des membres");
  }

  if (!project.membres.includes(membreId)) {
    project.membres.push(membreId);
    await project.save();
  }

  return await project.populate('membres', 'nom email');
}

async function retirerMembre(projectId, userId, membreId) {
  const project = await Project.findById(projectId);
  if (!project) return null;

  if (project.proprietaire.toString() !== userId) {
    throw new Error("Seul le propriétaire peut retirer un membre");
  }

  project.membres = project.membres.filter((m) => m.toString() !== membreId);
  await project.save();

  return await project.populate('membres', 'nom email');
}

async function supprimerProject(id, userId) {
  const project = await Project.findById(id);
  if (!project) return false;

  if (project.proprietaire.toString() !== userId) {
    throw new Error("Seul le propriétaire peut supprimer ce projet");
  }

  await Project.findByIdAndDelete(id);
  return true;
}

module.exports = {
  getProjects,
  getProjectParId,
  creerProject,
  modifierProject,
  ajouterMembre,
  retirerMembre,
  supprimerProject
};