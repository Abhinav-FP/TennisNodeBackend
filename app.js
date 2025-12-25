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
const axios = require("axios");

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
app.use("/bni", require("./routes/bniRoutes"));
app.use(errorHandler);

function getQueryParams(url) {
  const params = {};
  const queryString = url.split('?')[1];
  if (!queryString) return params;

  const pairs = queryString.split('&');
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    params[decodeURIComponent(key)] = decodeURIComponent(value || '');
  }

  return params;
}
const RetrieveData = async(url)=>{
  try{
      const queryParams = getQueryParams(url);
  // console.log(queryParams);
  const data = await axios.post('https://aita.tenniskhelo.com/ITF/save-ranks', {
      'category' :  queryParams?.category,
      'TournamentType' : queryParams?.tournament_type,
      'Gender' :  queryParams?.gender,
      'MatchType' : queryParams?.match_type,
      'Age' : queryParams?.age,
  });
  // console.log(data?.data);
  return data?.data?.data;
  const response = await axios.post(url, {itfData: data?.data?.data});
  // console.log("response",response?.data);
  logger.info(`Successfully hit URL ${url}`);
  }catch(error)
  {
    logger.error(`Error hitting URL ${error}`);    
    console.log("err",error);
  }
}

app.post("/rank", async(req, res) => {
  try{
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }
  const data = await RetrieveData(url);
  res.json({
    msg: 'Success',
    status: 200,
    data,
  });
  }catch(error){
    console.log("error",error);
     res.json({
      msg: 'An unknown error occured',
      status: 200,
    });
  }
});

app.get("/", (req, res) => {
  res.json({
    msg: 'hello',
    status: 200,
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

require('./cronJobs');

module.exports = app;
