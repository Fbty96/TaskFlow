const Task = require('../models/task');
const Backlog = require('../models/backlog');
const Project = require('../models/project');
const Workflow = require('../models/workflow');
const WorkflowStep = require('../models/workflowStep');
const { estMembreDuProjet } = require('../utils/autorisation');
const Comment = require('../models/comment');


async function getPremiereEtape(projetId) {
  const workflow = await Workflow.findOne({ projet: projetId });
  if (!workflow) throw new Error("Workflow introuvable pour ce projet");

  const premiereEtape = await WorkflowStep.findOne({ workflow: workflow._id }).sort({ ordre: 1 });
  if (!premiereEtape) throw new Error("Aucune étape trouvée dans le workflow");

  return premiereEtape;
}

async function getTasksParBacklog(backlogId, userId) {
  const backlog = await Backlog.findById(backlogId);
  if (!backlog) throw new Error("Backlog introuvable");

  const autorise = await estMembreDuProjet(backlog.projet, userId);
  if (!autorise) throw new Error("Accès refusé à ce projet");

  const taches = await Task.find({ backlog: backlogId })
    .populate('statutActuel', 'nom ordre couleur')
    .populate('sprint', 'nom')
    .populate('assigneA', 'nom email')
    .lean();

  const compteurs = await Comment.aggregate([
    { $match: { tache: { $in: taches.map((t) => t._id) } } },
    { $group: { _id: '$tache', total: { $sum: 1 } } }
  ]);

  const compteurParTache = {};
  compteurs.forEach((c) => { compteurParTache[c._id.toString()] = c.total; });

  return taches.map((t) => ({ ...t, nombreCommentaires: compteurParTache[t._id.toString()] || 0 }));
}

async function creerTask(backlogId, donnees, userId) {
  const backlog = await Backlog.findById(backlogId);
  if (!backlog) throw new Error("Backlog introuvable");

  const autorise = await estMembreDuProjet(backlog.projet, userId);
  if (!autorise) throw new Error("Accès refusé à ce projet");

  const premiereEtape = await getPremiereEtape(backlog.projet);

  const nouvelleTask = new Task({
    ...donnees,
    backlog: backlogId,
    statutActuel: premiereEtape._id
  });
  return await nouvelleTask.save();
}

async function modifierTask(id, userId, nouvellesDonnees) {
  const task = await Task.findById(id);
  if (!task) return null;

  const backlog = await Backlog.findById(task.backlog);
  const autorise = await estMembreDuProjet(backlog.projet, userId);
  if (!autorise) throw new Error("Accès refusé à ce projet");

  Object.assign(task, nouvellesDonnees);
  return await task.save();
}

async function changerStatut(id, userId, nouveauStatutId) {
  const task = await Task.findById(id);
  if (!task) return null;

  const backlog = await Backlog.findById(task.backlog);
  const autorise = await estMembreDuProjet(backlog.projet, userId);
  if (!autorise) throw new Error("Accès refusé à ce projet");

  const workflow = await Workflow.findOne({ projet: backlog.projet });
  const etapeValide = await WorkflowStep.findOne({ _id: nouveauStatutId, workflow: workflow._id });
  if (!etapeValide) throw new Error("Cette étape n'appartient pas au workflow de ce projet");

  task.statutActuel = nouveauStatutId;
  return await task.save();
}

async function assignerSprint(id, userId, sprintId) {
  const task = await Task.findById(id);
  if (!task) return null;

  const backlog = await Backlog.findById(task.backlog);
  const autorise = await estMembreDuProjet(backlog.projet, userId);
  if (!autorise) throw new Error("Accès refusé à ce projet");

  task.sprint = sprintId || null;
  return await task.save();
}

async function supprimerTask(id, userId) {
  const task = await Task.findById(id);
  if (!task) return false;

  const backlog = await Backlog.findById(task.backlog);
  const project = await Project.findById(backlog.projet);

  if (project.proprietaire.toString() !== userId) {
    throw new Error("Seul le propriétaire du projet peut supprimer une tâche");
  }

  await Task.findByIdAndDelete(id);
  return true;
}

async function assignerUtilisateur(id, userId, utilisateurId) {
  const task = await Task.findById(id);
  if (!task) return null;

  const backlog = await Backlog.findById(task.backlog);
  const autorise = await estMembreDuProjet(backlog.projet, userId);
  if (!autorise) throw new Error("Accès refusé à ce projet");

  task.assigneA = utilisateurId;
  return await task.save();
}

async function retirerAssignation(id, userId) {
  const task = await Task.findById(id);
  if (!task) return false;

  const backlog = await Backlog.findById(task.backlog);
  const autorise = await estMembreDuProjet(backlog.projet, userId);
  if (!autorise) throw new Error("Accès refusé à ce projet");

  task.assigneA = null;
  return await task.save();
}

async function getMesTaches(userId) {
  const projets = await Project.find({
    $or: [{ proprietaire: userId }, { membres: userId }]
  });

  const backlogs = await Backlog.find({ projet: { $in: projets.map(p => p._id) } });

  return await Task.find({ backlog: { $in: backlogs.map(b => b._id) }, assigneA: userId })
    .populate('statutActuel', 'nom ordre couleur')
    .populate('assigneA', 'nom email')
    .populate({
      path: 'backlog',
      populate: { path: 'projet', select: 'titre' }
    });
}

module.exports = {
  getTasksParBacklog,
  creerTask,
  modifierTask,
  changerStatut,
  assignerSprint,
  assignerUtilisateur, 
  retirerAssignation,
  supprimerTask, getMesTaches
};