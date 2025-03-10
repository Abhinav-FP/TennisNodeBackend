const Ranks=require("../db/ranks")
const catchAsync = require("../utils/catchAsync");
const puppeteer = require("puppeteer");

const keyMappings = {
  MENS: "MT",
  WOMENS: "WT",
  JUNIORS: "JT",
  MASTERS: "VT",
  BEACH: "BT",
  WHEELCHAIR: "WCT",
};

exports.ITFRanksSave = catchAsync(async (req, res, next) => {
  try {
    const circuit = req?.body?.category?.toUpperCase();
    if (!circuit || !keyMappings[circuit]) {
      return res.status(400).json({
        status: false,
        message: "Invalid category",
      });
    }
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.goto(
      `https://www.itftennis.com/tennis/api/PlayerRankApi/GetPlayerRankings?circuitCode=${keyMappings[circuit]}&matchTypeCode=S&ageCategoryCode=&take=25&isOrderAscending=true`,
      { waitUntil: "networkidle2" }
    );

    let data = await page.evaluate(() => document.body.innerText);
    data=JSON.parse(data);

    await browser.close();

    return res.status(200).json({
      status: true,
      message: "Data Stored Successfully",
      data:data,
    });

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
      return res.status(200).json({
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

exports.ITFCalendarSave = catchAsync(async (req, res, next) => {
  try {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.goto(
      "https://www.itftennis.com/tennis/api/TournamentApi/GetCalendar?circuitCode=WT&searchString=&skip=0&take=304&nationCodes=&zoneCodes=&dateFrom=2025-01-01&dateTo=2025-12-31&indoorOutdoor=&categories=&isOrderAscending=true&orderField=startDate&surfaceCodes=",
      { waitUntil: "networkidle2" }
    );

    let data = await page.evaluate(() => document.body.innerText);
    data=JSON.parse(data);

    await browser.close();

    // const response=await Ranks.insertMany(data.items);
    // console.log("response",response);

    return res.status(200).json({
      status: true,
      message: "Data Stored Successfully",
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "An error occurred.",
      error: error.message,
    });
  }
});