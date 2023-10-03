const jsonwebtoken = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = require("express").Router();
const connection = require("../../database/index");
const { key, keyPub } = require("../../keys");

router.post("/", async (req, res) => {
  console.log(req.body);
  const pseudo = req.body.pseudo;
  const password = req.body.password;
  const sqlVerify = `SELECT * FROM user WHERE pseudo = ?`;
  connection.query(sqlVerify, [pseudo], (err, result) => {
    try {
      // console.log(result[0]);
      if (result.length > 0) {
        const user = result[0]; // result renvoie un tableau nous avons besoin de récuperé l'index à l'index 0
        const userId = user.id;
        // console.log(userId, userPasswordDatabase);
        // Bcrypt vas crypté le mdp que l'utilisateur entre dans la partie front, pour le comparé à celui en base de données et créer le token si la comparaison est bonne
        if (bcrypt.compareSync(password, user.mdp)) {
          const token = jsonwebtoken.sign({}, key, {
            subject: userId.toString(),
            expiresIn: 3600 * 24 * 30 * 6,
            algorithm: "RS256",
          });
          res.cookie("token", token); // on définie un nom au cookie et on lui associe le token précédemment créer
          res.send(user); // on revoie les données de l'utilisateur connecter dans le front
        }
        // res
        // 	.status(400)
        // 	.send(JSON.stringify("Pseudo et/ou mot de passe incorrect"));
        else {
          res
            .status(400)
            .send(JSON.stringify("Pseudo et/ou mot de passe incorrect"));
        }
      } else {
        res
          .status(400)
          .send(JSON.stringify("Pseudo et/ou mot de passe incorrect"));
      }
    } catch (error) {
      console.log(error);
      res
        .status(400)
        .send(JSON.stringify("Pseudo et/ou mot de passe incorrect"));
    }
  });
});

router.get("/current", async (req, res) => {
  const { token } = req.cookies;
  console.log(token);
  if (token) {
    try {
      const decodedToken = jsonwebtoken.verify(token, keyPub, {
        algorithms: "RS256",
      });
      // console.log({ decodedToken });
      const sqlVerify = `SELECT id
			, pseudo FROM user WHERE id=${decodedToken.sub}`;
      connection.query(sqlVerify, (err, result) => {
        const currentUser = result[0];
        if (currentUser) {
          // console.log(result);
          return res.send(currentUser);
        } else {
          res.send(JSON.stringify(null));
        }
      });
    } catch (error) {
      res.send(JSON.stringify(null));
    }
  } else {
    res.send(JSON.stringify(null));
  }
});

router.delete("/", (req, res) => {
  res.clearCookie("token");
  res.end();
});

module.exports = router;
