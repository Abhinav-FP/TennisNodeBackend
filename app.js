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
  logger.info("Code Started");
  console.log(`Server listening at http://localhost:${port}`);
});

cron.schedule("0 6,18 * * *", async () => {
  logger.info("Running cron job 1st url");
  console.log("Running scheduled job at 6 AM...");
  
  try {
    const response1 = await axios.get("https://control.tenniskhelo.com/api/save-aita-calender-data");
    logger.info("Running cron job 1st url");
    logger.info("First URL response:", response1.data);
  } catch (error) {
    logger.info("Error hitting first URL:", error.message);
  }

  // try {
  //   const response2 = await axios.get("https://control.tenniskhelo.com/api/run/aita-job");
  //   logger.info("Running cron job 2nd url");
  //   console.log("Second URL response:", response2.data);
  // } catch (error) {
  //   console.error("Error hitting second URL:", error.message);
  // }
});

const urls = [
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=m&match_type=s&age=v35",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=m&match_type=s&age=v40",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=m&match_type=s&age=v45",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=m&match_type=s&age=v50",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=m&match_type=s&age=v55",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=m&match_type=s&age=v60",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=m&match_type=s&age=v65",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=m&match_type=s&age=v70",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=m&match_type=s&age=v75",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=m&match_type=s&age=v80",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=m&match_type=s&age=v85",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=m&match_type=s&age=v90",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=m&match_type=d&age=v35",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=m&match_type=d&age=v40",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=m&match_type=d&age=v45",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=m&match_type=d&age=v50",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=m&match_type=d&age=v55",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=m&match_type=d&age=v60",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=m&match_type=d&age=v65",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=m&match_type=d&age=v70",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=m&match_type=d&age=v75",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=m&match_type=d&age=v80",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=m&match_type=d&age=v85",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=m&match_type=d&age=v90",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=m&match_type=mx&age=v35",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=m&match_type=mx&age=v40",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=m&match_type=mx&age=v45",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=m&match_type=mx&age=v50",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=m&match_type=mx&age=v55",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=m&match_type=mx&age=v60",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=m&match_type=mx&age=v65",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=m&match_type=mx&age=v70",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=m&match_type=mx&age=v75",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=m&match_type=mx&age=v80",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=m&match_type=mx&age=v85",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=m&match_type=mx&age=v90",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=w&match_type=s&age=v35",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=w&match_type=s&age=v40",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=w&match_type=s&age=v45",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=w&match_type=s&age=v50",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=w&match_type=s&age=v55",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=w&match_type=s&age=v60",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=w&match_type=s&age=v65",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=w&match_type=s&age=v70",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=w&match_type=s&age=v75",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=w&match_type=s&age=v80",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=w&match_type=s&age=v85",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=w&match_type=s&age=v90",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=w&match_type=d&age=v35",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=w&match_type=d&age=v40",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=w&match_type=d&age=v45",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=w&match_type=d&age=v50",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=w&match_type=d&age=v55",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=w&match_type=d&age=v60",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=w&match_type=d&age=v65",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=w&match_type=d&age=v70",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=w&match_type=d&age=v75",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=w&match_type=d&age=v80",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=w&match_type=d&age=v85",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=w&match_type=d&age=v90",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=w&match_type=mx&age=v35",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=w&match_type=mx&age=v40",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=w&match_type=mx&age=v45",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=w&match_type=mx&age=v50",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=w&match_type=mx&age=v55",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=w&match_type=mx&age=v60",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=w&match_type=mx&age=v65",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=w&match_type=mx&age=v70",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=w&match_type=mx&age=v75",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=w&match_type=mx&age=v80",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=w&match_type=mx&age=v85",
  "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=&gender=w&match_type=mx&age=v90"
];

let currentIndex = 0; 

cron.schedule('*/1 * * * *', async () => {
  const urlToHit = urls[currentIndex];
  logger.info(`Hitting URL #${currentIndex + 1}: ${urlToHit}`);
  console.log(`Hitting URL #${currentIndex + 1}: ${urlToHit}`);

  try {
    const response = axios.get(urlToHit);
    // logger.info(`Status: ${response.status}`);
    // console.log(`Status: ${response.status}`);
  } catch (err) {
    logger.error(`Error hitting URL #${currentIndex + 1}:`, err.message);
    console.log(`Error hitting URL #${currentIndex + 1}:`, err.message);
  } finally {
    currentIndex = (currentIndex + 1) % urls.length;
    console.log(`Updating the index now to ${currentIndex}`);
  }
});

module.exports = app;
