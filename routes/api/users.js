const bcrypt = require("bcrypt"); // import du module bcrypt qui permet d'encrypter les mots de passe
const router = require("express").Router();
const connection = require("../../database/index"); // import la connection à la bdd

// ajout d'utilisateur
router.post("/", async (req, res) => {
  // Recupération des données entrées par l'utilisateur sur la page "inscription"
  const email = req.body.email;
  const pseudo = req.body.pseudo;
  const password = req.body.password;
  const passwordCrypt = await bcrypt.hash(password, 8); // on encrypte le mot de passe via le module "bcrypt"
  const values = [email, pseudo, passwordCrypt];

  //SI NON on fait pareil avec le pseudo
  const sql_verifPseudo = `SELECT * FROM user WHERE pseudo = ?`; // requête pour vérifier si le pseudo est unique
  connection.query(sql_verifPseudo, [pseudo], (err, result) => {
    // console.log("test");
    if (err) throw err;
    //SI oui on renvoie une erreur pour prévenir l'utilisateur que le pseudo est déjà pris
    if (result.length > 0) {
      console.log("test2");
      res
        .status(400)
        .send(JSON.stringify("Le pseudo est déjà en base de données"));
    } else {
      console.log("test3");
      //SI NON on ajoute l'utilisateur en bdd
      const sql = `INSERT INTO user (email,pseudo , mdp) VALUES (?, ?, ?)`; // requête d'insertion des données de l'utilisateur à l'inscription
      connection.query(sql, values, (err, result) => {
        console.log("test4");
        if (err) throw err;
        res.send(JSON.stringify(result));
      });
    }
  });
});

// update pseudo
router.post("/updatePseudo", (req, res) => {
  const pseudo = req.body.pseudo;
  const userId = req.body.id;
  const updateSql = `UPDATE user SET pseudo= ? WHERE id = ?`;
  connection.query(updateSql, [pseudo, userId], (err, result) => {
    console.log("user pseudo update");
    if (err) throw err;
    res.send(JSON.stringify(result));
  });
  console.log(req.body);
});

// update password
router.post("/updatePassword", async (req, res) => {
  const password = req.body.mdp;
  const passwordCrypt = await bcrypt.hash(password, 8);
  const userId = req.body.id;
  const updateSql = `UPDATE user SET mdp= ? WHERE id = ?`;
  connection.query(updateSql, [passwordCrypt, userId], (err, result) => {
    console.log("user password update");
    if (err) throw err;
    res.send(JSON.stringify(result));
  });
  console.log(req.body);
});

// delete user
router.post("/deleteUser", (req, res) => {
  const userId = req.body.id;
  const deleteSql = `DELETE FROM user WHERE id = ?`;
  connection.query(deleteSql, userId, (err, result) => {
    console.log("user delete");
    if (err) throw err;
    res.send(JSON.stringify(result));
  });
  console.log(req.body);
});

module.exports = router;
