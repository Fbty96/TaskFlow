const { getNotificationsUser, marquerCommeLue } = require('../services/notificationService');

async function lister(req, res, next) {
  try {
    const notifications = await getNotificationsUser(req.user.id);
    res.json(notifications);
  } catch (err) {
    next(err);
  }
}

async function marquerLue(req, res, next) {
  try {
    const notification = await marquerCommeLue(req.params.id, req.user.id);
    if (!notification) return res.status(404).json({ message: "Notification non trouvée" });
    res.json(notification);
  } catch (err) {
    if (err.message.includes("appartient")) {
      return res.status(403).json({ message: err.message });
    }
    next(err);
  }
}

module.exports = { lister, marquerLue };