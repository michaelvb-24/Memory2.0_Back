const router = require("express").Router();
const apiUsers = require("./users");
const apiAuth = require("./auth");
const apiClassement = require("./classement");
const apiForgotPassword = require("./forgotpassword");

router.use("/users", apiUsers);
router.use("/auth", apiAuth);
router.use("/classement", apiClassement);
router.use("/forgotpassword", apiForgotPassword);

module.exports = router;
