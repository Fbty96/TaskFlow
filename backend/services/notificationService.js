const Notification = require('../models/notification');

async function getNotificationsUser(userId) {
  return await Notification.find({ destinataire: userId }).sort({ dateEnvoi: -1 });
}

async function marquerCommeLue(id, userId) {
  const notification = await Notification.findById(id);
  if (!notification) return null;

  if (notification.destinataire.toString() !== userId) {
    throw new Error("Cette notification ne vous appartient pas");
  }

  notification.lu = true;
  return await notification.save();
}

async function creerNotification(destinataireId, type, message, tacheId = null) {
  const nouvelleNotification = new Notification({
    destinataire: destinataireId,
    type,
    message,
    tache: tacheId
  });
  return await nouvelleNotification.save();
}


module.exports = { getNotificationsUser, marquerCommeLue, creerNotification };