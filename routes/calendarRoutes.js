const express = require("express");
const calendarController = require("../controllers/calendarController");
// const cron = require("node-cron");

const router = express.Router();

router.get("/get", calendarController.getData);

module.exports = router;