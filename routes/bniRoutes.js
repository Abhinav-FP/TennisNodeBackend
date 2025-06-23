const express = require("express");
const { saveBNIData, saveBNIuuid, SaveProfile, checkApi } = require("../controllers/bniController");

const router = express.Router();

router.get("/save", saveBNIData);
router.get("/uuid-add", saveBNIuuid);
router.get("/profile", SaveProfile);
router.post("/ip-check", checkApi);

module.exports = router;