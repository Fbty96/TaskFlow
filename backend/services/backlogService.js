const Backlog = require('../models/backlog');

async function creerBacklog(projetId, titreProjet) {
  const backlog = new Backlog({
    titre: `Backlog - ${titreProjet}`,
    description: "Backlog créé automatiquement",
    projet: projetId
  });
  return await backlog.save();
}

async function getBacklogParProjet(projetId) {
  return await Backlog.findOne({ projet: projetId });
}

module.exports = { creerBacklog, getBacklogParProjet };