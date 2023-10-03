const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "memorize2.0",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connecté à la base de données MySQL");
});

module.exports = connection;
