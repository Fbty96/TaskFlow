const Comment = require('../models/comment');
const Task = require('../models/task');
const Backlog = require('../models/backlog');
const Project = require('../models/project');
const { estMembreDuProjet } = require('../utils/autorisation');


async function getCommentsParTask(taskId, userId) {
  const task = await Task.findById(taskId);
  if (!task) throw new Error("Tâche introuvable");

  const backlog = await Backlog.findById(task.backlog);
  const autorise = await estMembreDuProjet(backlog.projet, userId);
  if (!autorise) throw new Error("Accès refusé à ce projet");

  return await Comment.find({ tache: taskId }).populate('auteur', 'nom email').sort({ createdAt: 1 });
}

async function creerComment(taskId, contenu, userId) {
  const task = await Task.findById(taskId);
  if (!task) throw new Error("Tâche introuvable");

  const backlog = await Backlog.findById(task.backlog);
  const autorise = await estMembreDuProjet(backlog.projet, userId);
  if (!autorise) throw new Error("Accès refusé à ce projet");

  const nouveauComment = new Comment({ contenu, auteur: userId, tache: taskId });
  return await nouveauComment.save();
}

async function supprimerComment(id, userId) {
  const comment = await Comment.findById(id);
  if (!comment) return false;

  if (comment.auteur.toString() !== userId) {
    throw new Error("Seul l'auteur peut supprimer son commentaire");
  }

  await Comment.findByIdAndDelete(id);
  return true;
}

module.exports = { getCommentsParTask, creerComment, supprimerComment };