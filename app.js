const express = require("express");
const pdfRoutes = require("./routes/pdfRoutes");
const calendarRoutes = require("./routes/calendarRoutes");
const keyRoutes = require("./routes/keyRoutes");
const ITFRoutes = require("./routes/ITFRoutes");
const multer = require("multer"); 
require('dotenv').config();
const axios = require("axios");
const cron = require("node-cron");
const { errorHandler } = require("./utils/errorHandler");
const cors = require("cors");
const logger = require("./utils/logger");
require("./mongoconfig");

const port = process.env.PORT || 8080;
const app = express();

const corsOptions = {
  origin: "*",
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: '*',
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions)); 
app.use(express.json({ limit: '50mb' }));

upload = multer();
app.use(upload.none()); 

app.use("/api/extract", pdfRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/key", keyRoutes);
app.use("/ITF", ITFRoutes);

app.use(errorHandler);

app.get("/", (req, res) => {
  res.json({
    msg: 'hello',
    status: 200,
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

cron.schedule("0 6 * * *", async () => {
  console.log("Running scheduled job at 6 AM...");
  
  try {
    const response1 = await axios.get("https://control.tenniskhelo.com/api/save-aita-calender-data");
    logger.info("Running cron job 1st url");
    console.log("First URL response:", response1.data);
  } catch (error) {
    console.error("Error hitting first URL:", error.message);
  }

  try {
    const response2 = await axios.get("https://control.tenniskhelo.com/api/run/aita-job");
    logger.info("Running cron job 2nd url");
    console.log("Second URL response:", response2.data);
  } catch (error) {
    console.error("Error hitting second URL:", error.message);
  }
});


module.exports = app;
