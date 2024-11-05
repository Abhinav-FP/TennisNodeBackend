const { default: axios } = require("axios");
const pdfService = require("../services/pdfService");
const logger = require("../utils/logger");
const fs = require("fs").promises;
const Key = require("../db/key");

exports.extractPdfToJson = async (req, res) => {
  try {
    const { url, sub_category, category } = req.body;
    // console.log("req.body", req.body);
    if (!url) {
      return res
        .status(400)
        .json({ status: "fail", message: "URL parameter is required" });
    }
    logger.info(`Received request to process PDF from URL: ${url}`);
    const result = await pdfService.processPdf(url, sub_category, category);
    res.status(200).json({
      status: "true",
      data: result,
    });
  } catch (err) {
    logger.error(`Request failed: ${err.message}`);
    res.status(400).json({
      status: "false",
      message: err.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    // console.log("req.body.link", req.body);
    const { username, password } = req.body;
    const Api = axios.create({
      baseURL: `${process.env.Backend_Base_Url}`,
      headers: {
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
    const response = await Api.post("auth-verify", { username, password });
    // console.log("resp-data", response.data);
    if (response.data.success) {
      // token=response.data.token;
      // console.log("token",token);
      res.status(200).json({
        status: "true",
        data: response.data,
      });
    } else {
      res.status(401).json({
        status: "false",
        data: response.data,
      });
    }
  } catch (err) {
    // console.log("auth-error", err);
    logger.error(`Request failed: ${err.message}`);
    res.status(400).json({
      status: "false",
      message: err.message,
    });
  }
};

exports.logout = async (req, res) => {
  try {
    // console.log("req.body.link", req.body);
    const { token } = req.body;
    console.log("token",token);
    const Api = axios.create({
      baseURL: `${process.env.Backend_Base_Url}`,
      headers: {
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${token}`,
      },
    });
    const response = await Api.post("/logout");
    console.log("resp-data", response.data);
    if (response.data.success) {
      // token=response.data.token;
      // console.log("token",token);
      res.status(200).json({
        status: "true",
        data: response.data,
      });
    } else {
      res.status(401).json({
        status: "false",
        data: response.data,
      });
    }
  } catch (err) {
    // console.log("auth-error", err);
    logger.error(`Request failed: ${err.message}`);
    res.status(400).json({
      status: "false",
      message: err.message,
    });
  }
};

exports.rankingData = async (req, res) => {
  try {
    console.log("req.body", req.body);
    const { date, category, sub_category, rank, token } = req.body;
    const Api = axios.create({
      baseURL: `${process.env.Backend_Base_Url}`,
      headers: {
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${token}`, // Include your authorization token here
      },
    });
    let ranks=JSON.parse(rank);
    console.log("ranks",ranks)
    const response = await Api.post("/sync/ranks", {
      date,
      category,
      sub_category,
      ranks,
    });
    console.log("resp-data", response.data);
    // let jsonData = { date: `${date}` };
    // await fs.writeFile("./controllers/date.json", JSON.stringify(jsonData, null, 2), 'utf8');
    if (response.data.success) {
      res.status(200).json({
        status: "true",
        data: response.data,
      });
    } else {
      res.status(401).json({
        status: "false",
        data: response.data,
      });
    }
  } catch (err) {
    console.log("dataUpload error", err);
    logger.error(`Request failed: ${err.message}`);
    res.status(400).json({
      status: "false",
      message: err.message,
    });
  }
};

exports.getRankingDate = async (req, res) => {
  console.log("req.query", req.query);
  let type=`${req.query.category}${req.query.group}`;
  console.log("type",type);
  const data = await fs.readFile('./controllers/date.json', 'utf-8');
  const jsonObject = JSON.parse(data);
const result = jsonObject[type];
  res.status(200).json({
    status: "true",
    message: `For the selected combination the ranks were last updated on ${result}`,
  });
};

exports.automaticPdfExtraction = async (req, res) => {
  try {
    console.log("API Key:", req.headers["tk-api-key"]);
    const apikey= req.headers["tk-api-key"];
    const data=await Key.findOne({});
    if(apikey!=data?.value)
      {
        return res
      .status(403)
      .json({ status: "false", message: "Invalid key!" });
      }
    console.log("req.body",req.body);
    const { date, sub_category, category } = req.body;
    if (!date || !sub_category || !category) {
      return res
      .status(400)
      .json({ status: "false", message: "All fields are required!" });
    }
    const link_category=category.toUpperCase().replace("_","-");
    const url = `https://aitatennis.com/management/upload/ranking/${date}_${sub_category}${link_category}.pdf`;
    logger.info(`Received request to process PDF from URL: ${url}`);
    const result = await pdfService.processPdf(url, sub_category, category);
    res.status(200).json({
      status: "true",
      data: result,
    });
  } catch (err) {
    logger.error(`Request failed: ${err.message}`);
    res.status(400).json({
      status: "false",
      message: err.message,
    });
  }
};
