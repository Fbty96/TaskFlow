const Task = require('../models/task');
const Backlog = require('../models/backlog');
const { creerNotification } = require('./notificationService');
const Notification = require('../models/notification');

async function verifierEcheances() {
  const maintenant = new Date();
  const dansUnJour = new Date(maintenant.getTime() + 24 * 60 * 60 * 1000);

  const taches = await Task.find({
    echeance: { $exists: true, $ne: null },
    assigneA: { $exists: true, $ne: null }
  });

  for (const tache of taches) {
    if (!tache.echeance) continue;

    let type = null;
    if (tache.echeance < maintenant) {
      type = "retard";
    } else if (tache.echeance <= dansUnJour) {
      type = "echeance_proche";
    }

    if (!type) continue;

    const dejaEnvoyee = await Notification.findOne({
      tache: tache._id,
      type,
      destinataire: tache.assigneA
    });

    if (dejaEnvoyee) continue;

    await creerNotification(
      tache.assigneA,
      type,
      type === "retard"
        ? `La tâche "${tache.titre}" est en retard`
        : `La tâche "${tache.titre}" arrive à échéance dans moins de 24h`,
      tache._id
    );
  }

  console.log(`Vérification des échéances effectuée (${taches.length} tâches examinées)`);
}

module.exports = { verifierEcheances };