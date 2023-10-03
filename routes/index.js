const router = require("express").Router();
const apiUsers = require("./api");

router.use("/api", apiUsers);

module.exports = router;
