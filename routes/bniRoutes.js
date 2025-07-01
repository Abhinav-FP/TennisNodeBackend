const express = require("express");
const { checkApi, fetchBNIMembers } = require("../controllers/bniController");

const router = express.Router();

// router.get("/save", saveBNIData);
// router.get("/uuid-add", saveBNIuuid);
// router.get("/profile", SaveProfile);
router.get("/save", fetchBNIMembers);
router.post("/ip-check", checkApi);

module.exports = router;