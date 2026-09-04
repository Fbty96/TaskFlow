const Workflow = require('../models/workflow');
const WorkflowStep = require('../models/workflowStep');

const ETAPES_PAR_DEFAUT = [
  { nom: "To Do", ordre: 1, couleur: "#94A3B8" },
  { nom: "In Progress", ordre: 2, couleur: "#3B82F6" },
  { nom: "Review", ordre: 3, couleur: "#F59E0B" },
  { nom: "To Test", ordre: 4, couleur: "#A855F7" },
  { nom: "Testing", ordre: 5, couleur: "#EC4899" },
  { nom: "Done", ordre: 6, couleur: "#22C55E" }
];

async function creerWorkflowParDefaut(projetId, titreProjet) {
  const workflow = new Workflow({
    nom: `Workflow - ${titreProjet}`,
    description: "Workflow créé automatiquement",
    projet: projetId
  });
  await workflow.save();

  const etapes = await WorkflowStep.insertMany(
    ETAPES_PAR_DEFAUT.map((etape) => ({ ...etape, workflow: workflow._id }))
  );

  return { workflow, etapes };
}

async function getWorkflowParProjet(projetId) {
  const workflow = await Workflow.findOne({ projet: projetId });
  if (!workflow) return null;

  const etapes = await WorkflowStep.find({ workflow: workflow._id }).sort({ ordre: 1 });
  return { workflow, etapes };
}

async function ajouterEtape(workflowId, nom, ordre, couleur) {
  const nouvelleEtape = new WorkflowStep({ nom, ordre, couleur, workflow: workflowId });
  return await nouvelleEtape.save();
}

async function modifierEtape(id, nouvellesDonnees) {
  return await WorkflowStep.findByIdAndUpdate(id, nouvellesDonnees, { new: true });
}

async function supprimerEtape(id) {
  const resultat = await WorkflowStep.findByIdAndDelete(id);
  return resultat !== null;
}

module.exports = {
  creerWorkflowParDefaut,
  getWorkflowParProjet,
  ajouterEtape,
  modifierEtape,
  supprimerEtape
};