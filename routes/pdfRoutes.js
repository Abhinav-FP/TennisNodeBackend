const express = require("express");
const pdfController = require("../controllers/pdfController");
// const cron = require("node-cron");

const router = express.Router();

router.post("/pdf-to-json", pdfController.extractPdfToJson);
router.post("/login", pdfController.login);
router.post("/logout", pdfController.logout);
router.post("/ranking-data-post", pdfController.rankingData);

// cron.schedule('* * * * *', () => {
//     console.log("Hello World 2");
//     });
module.exports = router;
