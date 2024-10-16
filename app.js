const express = require("express");
const serverless = require("serverless-http");
const cron = require("node-cron");
const pdfRoutes = require("./routes/pdfRoutes");
const calendarRoutes = require("./routes/calendarRoutes");
const multer = require("multer"); 
require('dotenv').config();
const { errorHandler } = require("./utils/errorHandler");
const cors = require("cors");
const {cronerFunction}=require("./controllers/croner")

const port = process.env.PORT || 5000;
const hostName='0.0.0.0';
const app = express();
const router = express.Router();

const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}; 

app.use(cors(corsOptions)); 
app.use(express.json({ limit: '50mb' }));

app.get("/", (req, res) => {
  res.json({
    msg: 'hello',
    status: 200,
  });
});
upload = multer();
app.use(upload.none()); 

app.use("/api/extract", pdfRoutes);
app.use("/api/calendar", calendarRoutes);

app.use("/.netlify/functions/app", router);
app.use(errorHandler);
// cron.schedule('0 9,18 * * 1-5', () => {
//   cronerFunction();
// });
cron.schedule('0 * * * *', () => {
  cronerFunction();
});


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

module.exports = app;

