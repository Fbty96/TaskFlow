const { getWorkflowParProjet, ajouterEtape, modifierEtape, supprimerEtape } = require('../services/workflowService');

async function lister(req, res, next) {
  try {
    const resultat = await getWorkflowParProjet(req.params.projetId);
    if (!resultat) return res.status(404).json({ message: "Workflow non trouvé" });
    res.json(resultat);
  } catch (err) {
    next(err);
  }
}

async function creerEtape(req, res, next) {
  try {
    const { workflowId, nom, ordre, couleur } = req.body;
    const nouvelleEtape = await ajouterEtape(workflowId, nom, ordre, couleur);
    res.status(201).json(nouvelleEtape);
  } catch (err) {
    next(err);
  }
}

async function modifier(req, res, next) {
  try {
    const etape = await modifierEtape(req.params.id, req.body);
    if (!etape) return res.status(404).json({ message: "Étape non trouvée" });
    res.json(etape);
  } catch (err) {
    next(err);
  }
}

async function supprimer(req, res, next) {
  try {
    const supprime = await supprimerEtape(req.params.id);
    if (!supprime) return res.status(404).json({ message: "Étape non trouvée" });
    res.json({ message: "Étape supprimée" });
  } catch (err) {
    next(err);
  }
}

module.exports = { lister, creerEtape, modifier, supprimer };