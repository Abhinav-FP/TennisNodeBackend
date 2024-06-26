const express = require("express");
const serverless = require("serverless-http");
const pdfRoutes = require("./routes/pdfRoutes");
const { errorHandler } = require("./utils/errorHandler");
const cors = require("cors");

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

app.use("/api/extract", pdfRoutes);

app.use("/.netlify/functions/app", router);
app.use(errorHandler);

module.exports = app;
module.exports.handler = serverless(app);
