const Ranks=require("../db/ranks")
const axios = require("axios");
const catchAsync = require("../utils/catchAsync");
const puppeteer = require("puppeteer");

exports.ITFRanksSave = catchAsync(async (req, res, next) => {
  try {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.goto(
      "https://www.itftennis.com/tennis/api/PlayerRankApi/GetPlayerRankings?circuitCode=MT&matchTypeCode=S&ageCategoryCode=&take=2545&isOrderAscending=true",
      { waitUntil: "networkidle2" }
    );

    let data = await page.evaluate(() => document.body.innerText);
    data=JSON.parse(data);

    await browser.close();

    const response=await Ranks.insertMany(data.items);
    console.log("response",response);

    return res.status(200).json({
      status: true,
      message: "Data Stored Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "An error occurred.",
      error: error.message,
    });
  }
});

exports.RanksGet = catchAsync(async (req, res, next) => {
  try {
    const data = await Ranks.find().sort({ rank: 1 });
    if (!data || data.length === 0) {
      return res.status(204).json({
        status: false,
        message: "No data found",
        data: [],
      });
    }
    res.status(200).json({
      status: true,
      message: "Ranks retrieved successfully!",
      data: data,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "An unknown error occurred. Please try again later.",
    });
  }
});