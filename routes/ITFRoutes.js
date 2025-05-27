const express = require("express");
const ITFcontroller = require("../controllers/ITFcontroller");

const router = express.Router();

router.post("/save-ranks", ITFcontroller.RanksSave);
router.get("/get-ranks", ITFcontroller.RanksGet);
// router.get("/get-ranks-unique", ITFcontroller.RanksUniqueGet);
router.post("/save-calendar", ITFcontroller.CalendarSave);
router.get("/get-calendar", ITFcontroller.CalendarGet);

module.exports = router;