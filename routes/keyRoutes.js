const express = require("express");
const secretkeyController = require("../controllers/secretkeyController");

const router = express.Router();

router.get("/get", secretkeyController.KeyGet);
router.post("/add", secretkeyController.KeyAdd);
router.post("/edit", secretkeyController.KeyEdit);

//Test Route
router.post("/send-email", secretkeyController.SendEmail);

module.exports = router;