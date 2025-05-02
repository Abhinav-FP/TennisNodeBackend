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

// cron.schedule("0 6,18 * * *", async () => {
//   logger.info("Running cron job 1st url");
//   console.log("Running scheduled job at 6 AM...");
  
//   try {
//     const response1 = await axios.get("https://control.tenniskhelo.com/api/save-aita-calender-data");
//     logger.info("Running cron job 1st url");
//     logger.info("First URL response:", response1.data);
//   } catch (error) {
//     logger.info("Error hitting first URL:", error.message);
//   }

//   // try {
//   //   const response2 = await axios.get("https://control.tenniskhelo.com/api/run/aita-job");
//   //   logger.info("Running cron job 2nd url");
//   //   console.log("Second URL response:", response2.data);
//   // } catch (error) {
//   //   console.error("Error hitting second URL:", error.message);
//   // }
// });

// const urls = [
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MENS",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=WOMENS",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=itf&gender=B",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=chengu&gender=B",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=itf&gender=G",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&tournament_type=chengu&gender=G",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=S&age=v35",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=S&age=v40",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=S&age=v45",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=S&age=v50",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=S&age=v55",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=S&age=v60",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=S&age=v65",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=S&age=v70",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=S&age=v75",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=S&age=v80",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=S&age=v85",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=S&age=v90",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=D&age=v35",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=D&age=v40",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=D&age=v45",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=D&age=v50",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=D&age=v55",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=D&age=v60",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=D&age=v65",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=D&age=v70",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=D&age=v75",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=D&age=v80",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=D&age=v85",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=D&age=v90",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=MX&age=v35",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=MX&age=v40",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=MX&age=v45",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=MX&age=v50",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=MX&age=v55",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=MX&age=v60",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=MX&age=v65",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=MX&age=v70",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=MX&age=v75",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=MX&age=v80",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=MX&age=v85",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=M&match_type=MX&age=v90",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=S&age=v35",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=S&age=v40",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=S&age=v45",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=S&age=v50",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=S&age=v55",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=S&age=v60",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=S&age=v65",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=S&age=v70",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=S&age=v75",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=S&age=v80",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=S&age=v85",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=S&age=v90",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=D&age=v35",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=D&age=v40",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=D&age=v45",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=D&age=v50",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=D&age=v55",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=D&age=v60",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=D&age=v65",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=D&age=v70",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=D&age=v75",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=D&age=v80",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=D&age=v85",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=D&age=v90",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=MX&age=v35",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=MX&age=v40",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=MX&age=v45",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=MX&age=v50",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=MX&age=v55",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=MX&age=v60",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=MX&age=v65",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=MX&age=v70",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=MX&age=v75",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=MX&age=v80",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=MX&age=v85",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=MASTERS&gender=W&match_type=MX&age=v90",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=BEACH&gender=M",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=BEACH&gender=W",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=WHEELCHAIR&gender=M&match_type=S",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=WHEELCHAIR&gender=M&match_type=D",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=WHEELCHAIR&gender=W&match_type=S",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=WHEELCHAIR&gender=W&match_type=D",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=WHEELCHAIR&gender=Q&match_type=S",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=WHEELCHAIR&gender=Q&match_type=D",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=WHEELCHAIR&gender=B&match_type=S",
//   "https://dev-control.tenniskhelo.com/api/upload-itf-rank-manually?category=WHEELCHAIR&gender=G&match_type=S"
// ];

// let currentIndex = 0; 

// cron.schedule('*/1 * * * *', async () => {
//   const urlToHit = urls[currentIndex];
//   logger.info(`Hitting URL #${currentIndex + 1}: ${urlToHit}`);
//   console.log(`Hitting URL #${currentIndex + 1}: ${urlToHit}`);

//   try {
//     const response = axios.get(urlToHit);
//     // logger.info(`Status: ${response.status}`);
//     // console.log(`Status: ${response.status}`);
//   } catch (err) {
//     logger.error(`Error hitting URL #${currentIndex + 1}:`, err.message);
//     console.log(`Error hitting URL #${currentIndex + 1}:`, err.message);
//   } finally {
//     currentIndex = (currentIndex + 1) % urls.length;
//     console.log(`Updating the index now to ${currentIndex}`);
//   }
// });

module.exports = app;
