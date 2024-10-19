const express = require("express");
const calendarController = require("../controllers/calendarController");
// const cron = require("node-cron");

const router = express.Router();

router.get("/get", calendarController.getData);
router.post("/detailget", calendarController.FactSheetLink);
// router.post("/pdf/data", calendarController.extractcalendarData);

module.exports = router;