const express = require("express");
const cors = require("cors");
const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, 
}; 

const app = express();
app.get("/", (req, res) => {
  res.json({
    msg:'Okay',
    status:200
  })
});
// Apply CORS middleware
app.use(cors(corsOptions));

app.use(express.json({ limit: '50mb' }));

const pdfRoutes = require("./routes/pdfRoutes");

app.use("/api/extract", pdfRoutes);

const { errorHandler } = require("./utils/errorHandler");
app.use(errorHandler);

module.exports = app;
