const express = require("express");
const ITFcontroller = require("../controllers/ITFcontroller");

const router = express.Router();

router.post("/save-ranks", ITFcontroller.ITFRanksSave);
router.get("/get-ranks", ITFcontroller.RanksGet);
// router.get("/get-ranks-unique", ITFcontroller.RanksUniqueGet);
router.get("/save-calendar", ITFcontroller.ITFCalendarSave);

module.exports = router;