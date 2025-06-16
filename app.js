const express = require("express");
const pdfRoutes = require("./routes/pdfRoutes");
const calendarRoutes = require("./routes/calendarRoutes");
const keyRoutes = require("./routes/keyRoutes");
const ITFRoutes = require("./routes/ITFRoutes");
const EmailRoutes = require("./routes/emailRoutes");
const multer = require("multer"); 
require('dotenv').config();
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
  console.log(`Server listening at http://localhost:${port}`);
});

// require('./cronJobs')();

module.exports = app;
