const clients = {};

function ajouterClient(projetId, res) {
  if (!clients[projetId]) clients[projetId] = [];
  clients[projetId].push(res);
}

function retirerClient(projetId, res) {
  if (!clients[projetId]) return;
  clients[projetId] = clients[projetId].filter((r) => r !== res);
}

function notifierProjet(projetId, evenement) {
  const abonnes = clients[projetId] || [];
  abonnes.forEach((res) => {
    res.write(`data: ${JSON.stringify(evenement)}\n\n`);
  });
}

module.exports = { ajouterClient, retirerClient, notifierProjet };