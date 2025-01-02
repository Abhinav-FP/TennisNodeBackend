const express = require("express");
const calendarController = require("../controllers/calendarController");
// const cron = require("node-cron");

const router = express.Router();

router.get("/get", calendarController.getData);
router.post("/getlink", calendarController.FactSheetLink);
router.post("/pdf/data", calendarController.extractcalendarData);
router.post("/acceptance-list", calendarController.getAcceptanceList);

module.exports = router;