const connection = require("../../database/index");
const jsonwebtoken = require("jsonwebtoken");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { key, keyPub } = require("../../keys");

function sendEmail(email, link, callback) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "memorycda@gmail.com",
      pass: "jlou pubr yfkx dtbv",
    },
  });

  const mailOptions = {
    from: "memorycda@gmail.com",
    to: email,
    subject: "Mot de passe généré aléatoirement",
    text: `Veuillez cliquer sur le lien pour réinitialiser votre mot de passe : ${link}`,
  };

  transporter.sendMail(mailOptions, callback);
}

// Fonction utilitaire pour vérifier le token JWT
function verifyToken(token) {
  try {
    return jsonwebtoken.verify(token, keyPub);
  } catch (error) {
    return null; // En cas d'erreur de vérification, retourne null
  }
}

router.post("/", (req, res) => {
  try {
    const email = req.body.email;
    const sql = `SELECT * FROM user WHERE email = ?`;
    connection.query(sql, [email], (err, result) => {
      if (err) throw err;

      if (result[0]) {
        const token = jsonwebtoken.sign(
          { email: result[0].email, id: result[0].id },
          key,
          {
            expiresIn: "5m",
            algorithm: "RS256",
          }
        );

        const link = `http://localhost:8000/api/forgotpassword/${result[0].id}/${token}`;

        sendEmail(email, link, (error, info) => {
          if (error) {
            console.log("Erreur mail");
            res
              .status(500)
              .send(JSON.stringify("Erreur lors de l'envoi de l'e-mail."));
          } else {
            console.log("Email envoyé");
            res.status(200).send({ message: "Email envoyé avec succès." });
          }
        });
      } else {
        res.status(400).send(JSON.stringify("Utilisateur inconnu"));
      }
    });
  } catch (error) {
    console.error(error);
  }
});

router.get("/:id/:token", (req, res) => {
  try {
    const { id, token } = req.params;
    const verify = verifyToken(token);

    if (verify) {
      res.render("index", { email: verify.email, status: false, same: false });
    } else {
      res.send("Vérification invalide");
    }
  } catch (error) {
    console.error("Une erreur est survenue :", error);
    res
      .status(500)
      .send("Une erreur est survenue lors du traitement de la requête.");
  }
});

router.post("/:id/:token", async (req, res) => {
  console.log("TEST", req.body);
  console.log("TEST2", req.params);
  try {
    const { id, token } = req.params;
    const { password } = req.body;
    console.log(req.body);

    const sql = `SELECT * FROM user WHERE id = ?`;
    connection.query(sql, [id], async (err, result) => {
      if (err) throw err;

      if (result[0]) {
        console.log("TEST3", result[0]);
        const passwordCrypt = await bcrypt.hash(password, 8);
        const verify = verifyToken(token);

        if (verify) {
          console.log("TEST5", verify);
          const same = bcrypt.compareSync(password, result[0].mdp);

          if (same) {
            console.log("TEST7", same);
            res.render("index", {
              email: verify.email,
              status: false,
              same: true,
            });
          } else {
            console.log("TEST8");
            const updateSql = `UPDATE user SET mdp = ? WHERE id = ?`;
            connection.query(updateSql, [passwordCrypt, id], (err, result) => {
              if (err) throw err;
              res.render("index", {
                email: verify.email,
                status: true,
                same: false,
              });
            });
          }
        } else {
          console.log("TEST6");
          res.send(JSON.stringify(false));
        }
      } else {
        console.log("TEST4");
        res.send(JSON.stringify(false));
      }
    });
  } catch (error) {
    console.error("Une erreur est survenue :", error);
    res
      .status(500)
      .send("Une erreur est survenue lors du traitement de la requête.");
  }
});

module.exports = router;
