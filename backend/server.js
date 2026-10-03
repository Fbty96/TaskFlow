require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const jwt = require('jsonwebtoken');
const connecterDB = require('./config/db');
const { verifierEcheances } = require('./services/echeanceService');
const { ajouterClient, retirerClient, notifierProjet } = require('./services/sseService');

const authController = require('./controllers/authController');
const projectController = require('./controllers/projectController');
const taskController = require('./controllers/taskController');
const workflowController = require('./controllers/workflowController');
const sprintController = require('./controllers/sprintController');
const commentController = require('./controllers/commentController');
const notificationController = require('./controllers/notificationController');
const userController = require('./controllers/userController');
const verifierToken = require('./middlewares/verifierToken');

async function demarrer() {
  await connecterDB();

  const app = express();
  const corsOptions = {
  origin: [
    'http://localhost:5173',              // pour continuer à développer en local
    process.env.FRONTEND_URL              // votre frontend déployé sur Vercel
  ].filter(Boolean),
  credentials: true
};
app.use(cors(corsOptions));
  app.use(express.json());

  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  // Authentification (publiques)
  app.post('/auth/register', authController.register);
  app.post('/auth/login', authController.login);

  // Projets
  app.get('/projects', verifierToken, projectController.lister);
  app.get('/projects/:id', verifierToken, projectController.listerUn);
  app.post('/projects', verifierToken, projectController.creer);
  app.put('/projects/:id', verifierToken, projectController.modifier);
  app.post('/projects/:id/membres', verifierToken, projectController.ajouterMembreController);
  app.delete('/projects/:id/membres/:membreId', verifierToken, projectController.retirerMembreController);
  app.delete('/projects/:id', verifierToken, projectController.supprimer);

  app.get('/users/recherche', verifierToken, userController.rechercher);

  // Workflow (étapes)
  app.get('/projects/:projetId/workflow', verifierToken, workflowController.lister);
  app.post('/workflow-steps', verifierToken, workflowController.creerEtape);
  app.put('/workflow-steps/:id', verifierToken, workflowController.modifier);
  app.delete('/workflow-steps/:id', verifierToken, workflowController.supprimer);

  // Sprints
  app.get('/projects/:projetId/sprints', verifierToken, sprintController.lister);
  app.post('/projects/:projetId/sprints', verifierToken, sprintController.creer);
  app.put('/sprints/:id', verifierToken, sprintController.modifier);
  app.delete('/sprints/:id', verifierToken, sprintController.supprimer);

  // Tâches
  app.get('/backlogs/:backlogId/tasks', verifierToken, taskController.lister);
  app.post('/backlogs/:backlogId/tasks', verifierToken, taskController.creer);
  app.put('/tasks/:id', verifierToken, taskController.modifier);
  app.put('/tasks/:id/statut', verifierToken, taskController.changerStatutController);
  app.put('/tasks/:id/sprint', verifierToken, taskController.assignerSprintController);
  app.post('/tasks/:id/assignation', verifierToken, taskController.assignerUtilisateurController);
  app.delete('/tasks/:id/assignation', verifierToken, taskController.retirerAssignationController);
  app.delete('/tasks/:id', verifierToken, taskController.supprimer);

  // Commentaires
  app.get('/tasks/:taskId/comments', verifierToken, commentController.lister);
  app.post('/tasks/:taskId/comments', verifierToken, commentController.creer);
  app.delete('/comments/:id', verifierToken, commentController.supprimer);

  // Notifications
  app.get('/notifications', verifierToken, notificationController.lister);
  app.put('/notifications/:id/lu', verifierToken, notificationController.marquerLue);

  app.get('/mes-taches', verifierToken, taskController.mesTaches);

  // Temps réel (Server-Sent Events)
  app.get('/projects/:id/events', (req, res) => {
    const token = req.query.token;

    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).end();
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write('\n');

    ajouterClient(req.params.id, res);

    req.on('close', () => {
      retirerClient(req.params.id, res);
    });
  });

  // Gestion d'erreurs (toujours en dernier)
  app.use((err, req, res, next) => {
    console.error(err.stack);

    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    if (err.name === 'CastError') {
      return res.status(400).json({ message: "Identifiant invalide" });
    }

    res.status(500).json({ message: "Erreur serveur" });
  });

  cron.schedule('0 9 * * *', () => {
    console.log('Exécution du cron : vérification des échéances');
    verifierEcheances();
  });

  const PORT = process.env.PORT || 5002;
  app.listen(PORT, () => {
    console.log(`Serveur TaskFlow démarré sur http://localhost:${PORT}`);
  });
}

demarrer().catch((err) => {
  console.error('Erreur au démarrage du serveur :', err);
  process.exit(1);
});