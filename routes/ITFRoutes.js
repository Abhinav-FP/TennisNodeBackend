const express = require("express");
const ITFcontroller = require("../controllers/ITFcontroller");

const router = express.Router();

router.get("/save-ranks", ITFcontroller.ITFRanksSave);
router.get("/get-ranks", ITFcontroller.RanksGet);

module.exports = router;