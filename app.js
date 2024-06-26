const express = require("express");
const serverless = require("serverless-http");
const pdfRoutes = require("./routes/pdfRoutes");
const { errorHandler } = require("./utils/errorHandler");
const cors = require("cors");

const port = process.env.PORT || 5000;
const app = express();
const router = express.Router();
const pdfjsLib = require('pdfjs-dist');

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
// Specify the URL to the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

app.use("/api/extract", pdfRoutes);

app.use("/.netlify/functions/app", router);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
module.exports = app;
module.exports.handler = serverless(app);
