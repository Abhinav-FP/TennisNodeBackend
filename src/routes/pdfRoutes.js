const express = require("express");
const pdfController = require("../controllers/pdfController");

const router = express.Router();

router.post("/pdf-to-json", pdfController.extractPdfToJson);
router.post("/login", pdfController.login);
router.post("/ranking-data-post", pdfController.rankingData);

module.exports = router;
