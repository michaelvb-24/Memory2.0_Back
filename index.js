const bodyParser = require("body-parser"); // import de Body-parser
const express = require("express"); // import du module d'express
const cookie = require("cookie-parser"); // import de cookie-parser
const routes = require("./routes"); // on importe le fichier "index" qui se trouve dans "BackEnd/route"
const app = express(); // on associe la variale app à "l'appliacation express"
const connection = require("./database/index");

const port = 8000; // on défini le port d'ecoute du serveur
const cron = require("node-cron");

// cron.schedule("0 0 * * *", () => {
cron.schedule("*/5 * * * *", () => {
  // Logique à exécuter tous les jours à minuit
  console.log("Tâche exécutée");
});

// Middleware
app.use(bodyParser.json()); // permet de gerer les requêtes HTTP POST (il analyse les données encodées en JSON)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookie()); // permet d'accéder au jeton stocjé dans le cookie

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(routes); // on dis que les routes utilisées par l'application seront dans "routes" qui correspond à "./route"

app.set("view engine", "ejs");

app.get("/getScore", (req, res) => {
  const sql =
    "SELECT classement.*, user.pseudo FROM classement INNER JOIN user ON classement.id = user.id WHERE nom_jeux = 'flo' ORDER BY score ";
  connection.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send(JSON.stringify(result));
  });
});

app.get("/getScoreRomain", (req, res) => {
  const sql =
    "SELECT classement.*, user.pseudo FROM classement INNER JOIN user ON classement.id = user.id WHERE nom_jeux = 'romain' ORDER BY score ";
  connection.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send(JSON.stringify(result));
  });
});

// Gestion des erreurs 404
app.use(({ res }) => {
  const message =
    "Impossible de trouver la ressource demandée ! Vous pouvez essayer une autre URL.";
  res.status(404).json({ message });
});

app.listen(port, () => {
  console.log(`Serveur NodeJS ecoutant sur le port ${port}`);
});
