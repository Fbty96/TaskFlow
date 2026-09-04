const {
  getProjects,
  getProjectParId,
  creerProject,
  modifierProject,
  ajouterMembre,
  retirerMembre,
  supprimerProject
} = require('../services/projectService');

async function lister(req, res, next) {
  try {
    const projects = await getProjects(req.user.id);
    res.json(projects);
  } catch (err) {
    next(err);
  }
}

async function listerUn(req, res, next) {
  try {
    const project = await getProjectParId(req.params.id);
    if (!project) return res.status(404).json({ message: "Projet non trouvé" });
    res.json(project);
  } catch (err) {
    next(err);
  }
}

async function creer(req, res, next) {
  try {
    const { titre, description } = req.body;
    const nouveauProject = await creerProject(titre, description, req.user.id);
    res.status(201).json(nouveauProject);
  } catch (err) {
    next(err);
  }
}

async function modifier(req, res, next) {
  try {
    const project = await modifierProject(req.params.id, req.user.id, req.body);
    if (!project) return res.status(404).json({ message: "Projet non trouvé" });
    res.json(project);
  } catch (err) {
    if (err.message.includes("propriétaire")) {
      return res.status(403).json({ message: err.message });
    }
    next(err);
  }
}

async function ajouterMembreController(req, res, next) {
  try {
    const { membreId } = req.body;
    const project = await ajouterMembre(req.params.id, req.user.id, membreId);
    if (!project) return res.status(404).json({ message: "Projet non trouvé" });
    res.json(project);
  } catch (err) {
    if (err.message.includes("propriétaire")) {
      return res.status(403).json({ message: err.message });
    }
    next(err);
  }
}

async function retirerMembreController(req, res, next) {
  try {
    const project = await retirerMembre(req.params.id, req.user.id, req.params.membreId);
    if (!project) return res.status(404).json({ message: "Projet non trouvé" });
    res.json(project);
  } catch (err) {
    if (err.message.includes("propriétaire")) {
      return res.status(403).json({ message: err.message });
    }
    next(err);
  }
}

async function supprimer(req, res, next) {
  try {
    const supprime = await supprimerProject(req.params.id, req.user.id);
    if (!supprime) return res.status(404).json({ message: "Projet non trouvé" });
    res.json({ message: "Projet supprimé" });
  } catch (err) {
    if (err.message.includes("propriétaire")) {
      return res.status(403).json({ message: err.message });
    }
    next(err);
  }
}

module.exports = { lister, listerUn, creer, modifier, ajouterMembreController,retirerMembreController, supprimer };