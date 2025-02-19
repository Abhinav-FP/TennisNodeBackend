const express = require("express");
const calendarController = require("../controllers/calendarController");
const ITFController = require("../controllers/ITFcontroller");
// const cron = require("node-cron");

const router = express.Router();

router.get("/get", calendarController.getData);
router.get("/get-count", calendarController.getCounts);
router.post("/getlink", calendarController.FactSheetLink);
router.post("/pdf/data", calendarController.extractcalendarData);
router.post("/acceptance-list", calendarController.getAcceptanceList);

// ITF Data
router.get("/getITF", ITFController.getITFDetail);

module.exports = router;