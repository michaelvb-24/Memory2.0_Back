const connection = require("../../database");
const router = require("express").Router();


router.post("/", (req, res) => {
	const { userId, turns, jeux } = req.body;

	console.log(req.body);

	const sql = `INSERT INTO classement (score, id, nom_jeux) VALUES (?, ?, ?)`;
	connection.query(sql, [turns, userId, jeux], (err, result) => {
		console.log("score envoyé");
		if (err) throw err;
		res.send(JSON.stringify(result));
	});
});

module.exports = router;
