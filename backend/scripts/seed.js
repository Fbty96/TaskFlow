require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('../models/user');
const Project = require('../models/project');
const Backlog = require('../models/backlog');
const Workflow = require('../models/workflow');
const WorkflowStep = require('../models/workflowStep');
const Task = require('../models/task');

const ETAPES_PAR_DEFAUT = [
  { nom: "To Do", ordre: 1, couleur: "#94A3B8" },
  { nom: "In Progress", ordre: 2, couleur: "#3B82F6" },
  { nom: "Review", ordre: 3, couleur: "#F59E0B" },
  { nom: "To Test", ordre: 4, couleur: "#A855F7" },
  { nom: "Testing", ordre: 5, couleur: "#EC4899" },
  { nom: "Done", ordre: 6, couleur: "#22C55E" }
];

async function creerProjetComplet(titre, description, proprietaireId) {
  const project = await Project.create({ titre, description, proprietaire: proprietaireId, membres: [] });

  const backlog = await Backlog.create({
    titre: `Backlog - ${titre}`,
    description: "Backlog créé automatiquement",
    projet: project._id
  });

  const workflow = await Workflow.create({
    nom: `Workflow - ${titre}`,
    description: "Workflow créé automatiquement",
    projet: project._id
  });

  const etapes = await WorkflowStep.insertMany(
    ETAPES_PAR_DEFAUT.map((etape) => ({ ...etape, workflow: workflow._id }))
  );

  return { project, backlog, workflow, etapes };
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connecté à MongoDB, nettoyage en cours...');

  await User.deleteMany({});
  await Project.deleteMany({});
  await Backlog.deleteMany({});
  await Workflow.deleteMany({});
  await WorkflowStep.deleteMany({});
  await Task.deleteMany({});

  console.log('Création des utilisateurs...');
  const motDePasseChiffre = await bcrypt.hash('test1234', 10);
  const louis = await User.create({ nom: 'Louis', email: 'louis@taskflow.com', motDePasse: motDePasseChiffre });
  const sarah = await User.create({ nom: 'Sarah', email: 'sarah@taskflow.com', motDePasse: motDePasseChiffre });

  console.log('Création du projet StudyBuddy...');
  const { backlog: backlogStudyBuddy, etapes: etapesStudyBuddy } = await creerProjetComplet(
    "StudyBuddy - Assistant de révision IA",
    "Un chatbot qui crée des quiz à partir de mes cours en PDF, et qui suit ma progression matière par matière",
    louis._id
  );

  await Task.create([
    {
      titre: "Entraîner le modèle avec d'anciens examens",
      description: "Utiliser 200 annales pour que le modèle comprenne mieux les types de questions",
      priorite: 3,
      backlog: backlogStudyBuddy._id,
      statutActuel: etapesStudyBuddy[1]._id // In Progress
    },
    {
      titre: "Extraire les notions clés d'un PDF",
      description: "Repérer automatiquement les concepts importants dans un cours",
      priorite: 2,
      backlog: backlogStudyBuddy._id,
      statutActuel: etapesStudyBuddy[0]._id // To Do
    },
    {
      titre: "Créer l'interface de chat",
      description: "Une interface simple où l'étudiant pose ses questions",
      priorite: 1,
      backlog: backlogStudyBuddy._id,
      statutActuel: etapesStudyBuddy[0]._id // To Do
    }
  ]);

  console.log('Création du projet Jardin connecté...');
  const { backlog: backlogJardin, etapes: etapesJardin } = await creerProjetComplet(
    "Jardin connecté EcoCampus",
    "Des capteurs sur le jardin du campus pour suivre l'humidité et la lumière, avec des alertes quand il faut arroser",
    louis._id
  );

  await Task.create([
    {
      titre: "Calibrer les capteurs d'humidité",
      description: "Éviter les fausses alertes quand il pleut un peu",
      priorite: 2,
      backlog: backlogJardin._id,
      statutActuel: etapesJardin[0]._id
    },
    {
      titre: "Envoyer une alerte sur Discord",
      description: "Prévenir les bénévoles automatiquement s'il faut arroser",
      priorite: 1,
      backlog: backlogJardin._id,
      statutActuel: etapesJardin[0]._id
    }
  ]);

  console.log('\n Données de test créées avec succès !\n');
  console.log('Comptes disponibles (mot de passe : test1234) :');
  console.log('  - louis@taskflow.com (propriétaire des 2 projets)');
  console.log('  - sarah@taskflow.com (aucun projet, pour tester l\'ajout de membre)');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Erreur pendant le seed :', err);
  mongoose.disconnect();
});