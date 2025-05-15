const express = require("express");
const { saveData, addFactsheet, addEmail, getEmail, saveITFCalendar, itfAddEmail, itfGetEmail } = require("../controllers/emailController");

const router = express.Router();
// Hit these routes in this order-
// 1. Save Data
// 2. Add factSheet
// 3. Add emails
// 4. Get the data with emails
router.get("/aita-save", saveData);
router.get("/aita-factsheet-add", addFactsheet);
router.get("/aita-add-email", addEmail);
router.get("/aita-get", getEmail);
// ITF routes start here
router.get("/itf-save", saveITFCalendar);
router.get("/itf-add-email", itfAddEmail);
router.get("/itf-get-email", itfGetEmail);

module.exports = router;