const { default: axios } = require("axios");
const pdfService = require("../services/pdfService");
const logger = require("../utils/logger");

exports.extractPdfToJson = async (req, res) => {
  try {
    const { url, sub_category } = req.body;
    // console.log("req.body", req.body);
    if (!url) {
      return res
        .status(400)
        .json({ status: "fail", message: "URL parameter is required" });
    }

    logger.info(`Received request to process PDF from URL: ${url}`);

    const result = await pdfService.processPdf(url, sub_category);

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
      baseURL: "https://dev-control.tenniskhelo.com/api",
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

exports.rankingData = async (req, res) => {
  try {
    console.log("Hello");
    // console.log("req.body", req.body);
    const { date, category, sub_category, rank, token } = req.body;
    const Api = axios.create({
      baseURL: "https://dev-control.tenniskhelo.com/api",
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
