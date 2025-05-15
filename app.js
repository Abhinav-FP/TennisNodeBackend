const express = require("express");
const pdfRoutes = require("./routes/pdfRoutes");
const calendarRoutes = require("./routes/calendarRoutes");
const keyRoutes = require("./routes/keyRoutes");
const ITFRoutes = require("./routes/ITFRoutes");
const EmailRoutes = require("./routes/emailRoutes");
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
app.use("/email", EmailRoutes);

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
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=S&age=v30",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=D&age=v30",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=MX&age=v30",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=S&age=v30",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=D&age=v30",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=MX&age=v30",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=S&age=v35",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=S&age=v40",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=S&age=v45",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=S&age=v50",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=S&age=v55",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=S&age=v60",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=S&age=v65",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=S&age=v70",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=S&age=v75",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=S&age=v80",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=S&age=v85",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=S&age=v90",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=D&age=v35",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=D&age=v40",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=D&age=v45",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=D&age=v50",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=D&age=v55",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=D&age=v60",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=D&age=v65",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=D&age=v70",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=D&age=v75",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=D&age=v80",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=D&age=v85",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=D&age=v90",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=MX&age=v35",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=MX&age=v40",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=MX&age=v45",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=MX&age=v50",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=MX&age=v55",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=MX&age=v60",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=MX&age=v65",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=MX&age=v70",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=MX&age=v75",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=MX&age=v80",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=MX&age=v85",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=MX&age=v90",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=S&age=v35",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=S&age=v40",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=S&age=v45",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=S&age=v50",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=S&age=v55",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=S&age=v60",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=S&age=v65",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=S&age=v70",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=S&age=v75",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=S&age=v80",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=S&age=v85",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=S&age=v90",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=D&age=v35",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=D&age=v40",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=D&age=v45",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=D&age=v50",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=D&age=v55",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=D&age=v60",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=D&age=v65",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=D&age=v70",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=D&age=v75",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=D&age=v80",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=D&age=v85",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=D&age=v90",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=MX&age=v35",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=MX&age=v40",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=MX&age=v45",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=MX&age=v50",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=MX&age=v55",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=MX&age=v60",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=MX&age=v65",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=MX&age=v70",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=MX&age=v75",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=MX&age=v80",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=MX&age=v85",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=MX&age=v90",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=JUNIORS&tournament_type=itf&gender=B",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=JUNIORS&tournament_type=chengu&gender=B",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=JUNIORS&tournament_type=itf&gender=G",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=JUNIORS&tournament_type=chengu&gender=G",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=MENS",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=WOMENS",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=BEACH&gender=M",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=BEACH&gender=W",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=WHEELCHAIR&gender=M&match_type=S",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=WHEELCHAIR&gender=M&match_type=D",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=WHEELCHAIR&gender=W&match_type=S",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=WHEELCHAIR&gender=W&match_type=D",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=WHEELCHAIR&gender=Q&match_type=S",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=WHEELCHAIR&gender=Q&match_type=D",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=WHEELCHAIR&gender=B&match_type=S",
  "https://control.tenniskhelo.com/api/upload-itf-rank-manually?category=WHEELCHAIR&gender=G&match_type=S",
];

// let currentIndex = 0;
// let pauseUntil = null; // Timestamp when the pause ends

// cron.schedule('*/2 * * * *', async () => {
//   const now = Date.now();

//   if (pauseUntil && now < pauseUntil) {
//     const remainingMinutes = Math.ceil((pauseUntil - now) / 60000);
//     console.log(`Paused. Skipping execution. Resumes in ${remainingMinutes} min.`);
//     return;
//   }

//   const urlToHit = urls[currentIndex];
//   console.log(`Hitting URL #${currentIndex + 1}: ${urlToHit}`);

//   try {
//     await axios.get(urlToHit);
//     // logger.info(`Successfully hit URL #${currentIndex + 1}`);
//   } catch (err) {
//     // logger.error(`Error hitting URL #${currentIndex + 1}: ${err.message}`);
//   } finally {
//     currentIndex++;
//     // if (currentIndex >= urls.length) {
//       if ((currentIndex + 1) % urls.length === 0){
//       // All URLs hit once, start 6-hour pause
//       pauseUntil = Date.now() + 12 * 60 * 60 * 1000; // 12 hours in ms
//       currentIndex = 0;
//       console.log(`All URLs processed. Pausing for 6 hours.`);
//     } else {
//       console.log(`Updating the index now to ${currentIndex}`);
//     }
//   }
// });

module.exports = app;
