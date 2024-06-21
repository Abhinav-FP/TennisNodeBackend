const express = require("express");
const serverless = require("serverless-http");
const pdfRoutes = require("./routes/pdfRoutes");
const { errorHandler } = require("./utils/errorHandler");
const router = express.Router();

const cors = require("cors");
const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, 
}; 

const app = express();
app.get("/", (req, res) => {
  res.json({
    msg:'hello ',
    status:200
  })
});
// Apply CORS middleware
app.use(cors(corsOptions)); 

app.use(express.json({ limit: '50mb' }));

app.use("/.netlify/functions/app", router);
module.exports.handler = serverless(app);
// const pdfRoutes = require("./routes/pdfRoutes");

app.use("/api/extract", pdfRoutes);


app.use(errorHandler);

module.exports = app;
