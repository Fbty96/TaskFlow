# TaskFlow — Récapitulatif complet du projet

## 1. Vue d'ensemble

TaskFlow est une application de gestion de projets et de tâches collaborative (type Trello/Asana), développée en stack MERN (MongoDB, Express, React, Node.js), avec authentification JWT, navigation à deux niveaux (barre latérale + onglets par projet), et un système de notifications automatisé.

## 2. Stack technique

| Couche | Technologies |
|---|---|
| Backend | Node.js, Express.js |
| Base de données | MongoDB Atlas, Mongoose (ODM) |
| Authentification | JWT (jsonwebtoken), bcrypt |
| Tâches planifiées | node-cron |
| Frontend | React (Vite), fetch |
| Drag & drop | @dnd-kit/core |
| Graphiques | Recharts |
| Style | Tailwind CSS v4 |

## 3. Architecture backend

### Modèles Mongoose (9)

```
User         → nom, email, motDePasse (chiffré bcrypt)
Project      → titre, description, statut, proprietaire (ref User), membres (ref User[])
Backlog      → titre, description, projet (ref Project) — composition, 1/projet
Workflow     → nom, description, projet (ref Project) — composition, 1/projet
WorkflowStep → nom, ordre, couleur, workflow (ref Workflow) — plusieurs/workflow
Sprint       → nom, objectif, dateDebut, dateFin, statut, projet (ref Project)
Task         → titre, description, priorite, echeance, dureeEstimee,
               backlog (ref), sprint (ref, optionnel), statutActuel (ref WorkflowStep),
               assigneA (ref User, optionnel)
Comment      → contenu, auteur (ref User), tache (ref Task)
Notification → destinataire (ref User), type, message, tache (ref, optionnel), lu
```

**Décisions de modélisation :**
- Composition automatique : créer un `Project` crée automatiquement son `Backlog`, son `Workflow`, et 6 `WorkflowStep` par défaut
- `Assignment` (entité initialement prévue) a été retirée au profit d'un champ direct `Task.assigneA` — plus simple pour une assignation unique
- Référence toujours côté "plusieurs" (`Task.backlog`, jamais `Backlog.taches[]`), pour éviter la synchronisation manuelle de tableaux
- Index MongoDB sur `Task.backlog`, `Task.assigneA`, `Project.proprietaire`, `Project.membres` pour accélérer les requêtes fréquentes

### Services et controllers (9 domaines)

```
authService/Controller         → register, login (bcrypt + JWT)
projectService/Controller      → CRUD, composition auto, ajout membres
workflowService/Controller     → CRUD des étapes du workflow
sprintService/Controller       → CRUD sprint
taskService/Controller         → CRUD tâche, statut, assignation, sprint, "mes tâches" transverse
commentService/Controller      → commentaires sur une tâche
notificationService/Controller → liste, marquage lu, création (interne)
userService/Controller         → recherche par email (ajout de membre)
echeanceService                → cron : détection des tâches en retard/proches, sans doublon
```

### Sécurité

- Middleware `verifierToken` (JWT) sur toutes les routes protégées
- Distinction authentification (401) / autorisation (403)
- Règle métier : tout membre crée/modifie les tâches ; seul le propriétaire gère membres/backlog/sprints/workflow/suppression
- `.lean()` sur les requêtes de lecture seule (performance)

### Le cron job (notifications automatiques)

```javascript
cron.schedule('0 9 * * *', () => verifierEcheances());
```
Toutes les tâches ayant à la fois une échéance ET une personne assignée sont examinées :
- Échéance dépassée → notification "retard"
- Échéance dans moins de 24h → notification "echeance_proche"
- Vérification anti-doublon avant chaque création (`Notification.findOne(...)`)

**Point technique clé résolu :** le cron est déclaré **après** `await connecterDB()` dans une fonction `demarrer()` asynchrone — sans ça, le cron pouvait s'exécuter avant que MongoDB soit connecté, provoquant des timeouts.

## 4. Architecture frontend

### Navigation (2 niveaux)

```
Barre latérale (persistante)
 ├── Mes tâches       → vue transverse, toutes les tâches assignées, tous projets
 ├── Mes projets      → grille de projets, création
 └── Notifications    → liste, marquage comme lue au clic

Onglets (à l'intérieur d'un projet)
 ├── Tâches           → Kanban (drag & drop) ou Liste (triable), recherche + filtres
 ├── Workflow         → personnalisation des étapes (nom, couleur)
 ├── Sprints          → création, liste avec tâches associées
 └── Statistiques     → 3 graphiques (statut, membre, priorité)
```

### Composants principaux

```
Login, Register              → authentification, bascule entre les deux
Logo                          → signature visuelle (ruban des 6 couleurs du workflow)
ListeProjets, CreerProjet     → grille + création de projet
VueProjet                     → conteneur à onglets
OngletTaches                  → Kanban + Liste + recherche/filtres/tri
  ├── CarteTache, Colonne (Kanban)
  └── VueListe (tableau triable)
OngletWorkflow                → CRUD des étapes
OngletSprints                 → CRUD sprint + tâches liées
OngletStatistiques            → 3 graphiques Recharts
DetailTache                   → modale (Portal) : commentaires, assignation, sprint
CreerTache, GererMembres       → formulaires repliables
MesTaches, Notifications       → vues transverses
config.js                      → URL API centralisée (VITE_API_URL)
```

### Design system (Tailwind v4)

- Palette : fond papier neutre, encre pour tout le texte/chrome, **couleur réservée aux 6 étapes du workflow** (signature du produit — pas de violet/bleu "SaaS générique")
- Typographies : Space Grotesk (titres), IBM Plex Sans (texte), IBM Plex Mono (données)
- Responsive : Kanban en défilement horizontal sur mobile, sidebar cachée sur petit écran

## 5. Fonctionnalités intégrées, en détail

| Fonctionnalité | Ce qu'elle fait |
|---|---|
| Auth complète | Inscription, connexion, déconnexion, token géré en mémoire (state React) |
| Composition automatique | 1 projet créé = backlog + workflow + 6 étapes générés sans intervention |
| Drag & drop | `@dnd-kit`, avec `activationConstraint` pour distinguer clic (ouvrir détail) et glisser (déplacer) |
| Recherche + filtres | Texte, assigné, priorité — calcul frontend, sans requête réseau supplémentaire |
| Vue Liste | Alternative au Kanban, colonnes triables (statut, assigné, priorité) |
| Détail de tâche (modale) | `createPortal` pour un positionnement correct, indépendant du DOM parent |
| Commentaires | Ajout/lecture, liés à une tâche et un auteur |
| Assignation | Champ direct `assigneA`, modifiable depuis la modale |
| Sprint | Sélection optionnelle d'un sprint pour une tâche, visible dans l'onglet Sprints |
| Workflow personnalisable | Renommer, recolorer, ajouter, supprimer une étape |
| Mes tâches (transverse) | Agrège les tâches de tous les projets où l'utilisateur est propriétaire ou membre |
| Notifications | Génération automatique (cron), lecture, marquage comme lue |
| Statistiques | 3 graphiques Recharts, calculés côté frontend à partir des données déjà chargées |
| Gestion des membres | Recherche par email, ajout, restreint au propriétaire |

## 6. Le script de seed (mock data)

`scripts/seed.js` — recrée en une commande un jeu de données cohérent (2 utilisateurs, 2 projets complets, plusieurs tâches). Outil de développement, jamais exécuté en production, conservé pour les démonstrations et la reproductibilité des tests.

## 7. Ce qui reste

```
❌ Nettoyage : factoriser estMembreDuProjet (dupliquée dans 3 services)
❌ Débounce sur la recherche (préparé, à valider)
❌ Test de npm run build (jamais fait)
❌ CORS restreint (actuellement ouvert à tous, à limiter avant déploiement)
❌ Documentation (README, structure, installation)
❌ Déploiement (Render/Vercel)
❌ Rapport de stage
❌ Bonus optionnels : envoi d'email réel, Socket.io (temps réel), vue Calendrier
```
