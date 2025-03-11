const Ranks = require("../db/ranks");
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
    const category = keyMappings[circuit];

    if (category === "MT" || category === "WT") {
      await page.goto(
        `https://www.itftennis.com/tennis/api/PlayerRankApi/GetPlayerRankings?circuitCode=${keyMappings[circuit]}&matchTypeCode=S&ageCategoryCode=&take=6000&isOrderAscending=true`,
        { waitUntil: "networkidle2", timeout: 60000 }
      );
    } else if (category === "VT") {
      await page.goto(
        `https://www.itftennis.com/tennis/api/PlayerRankApi/GetPlayerRankings?circuitCode=${keyMappings[circuit]}&playerTypeCode=M&matchTypeCode=S&ageCategoryCode=V30&seniorRankingType=ITF&take=6000&isOrderAscending=true`,
        { waitUntil: "networkidle2", timeout: 60000 }
      );
    } else if (category === "BT") {
      await page.goto(
        `https://www.itftennis.com/tennis/api/PlayerRankApi/GetPlayerRankings?circuitCode=${keyMappings[circuit]}&playerTypeCode=M&ageCategoryCode=&take=6000&isOrderAscending=true`,
        { waitUntil: "networkidle2", timeout: 60000 }
      );
    } else if (category === "WCT") {
      await page.goto(
        `https://www.itftennis.com/tennis/api/PlayerRankApi/GetPlayerRankings?circuitCode=${keyMappings[circuit]}&playerTypeCode=M&matchTypeCode=S&ageCategoryCode=&take=6000&isOrderAscending=true`,
        { waitUntil: "networkidle2", timeout: 60000 }
      );
    } else {
      await page.goto(
        `https://www.itftennis.com/tennis/api/PlayerRankApi/GetPlayerRankings?circuitCode=${keyMappings[circuit]}&playerTypeCode=B&ageCategoryCode=&take=6000&isOrderAscending=true`,
        { waitUntil: "networkidle2", timeout: 60000 }
      );
    }

    let data = await page.evaluate(() => document.body.innerText);
    data = JSON.parse(data);

    await browser.close();

    const parts = data?.rankDate.split(" ");

    const formattedDate = new Date(
      Date.UTC(
        parseInt(parts[2]),
        new Date(parts[1] + " 1, 2000").getMonth(),
        parseInt(parts[0])
      )
    );

    if (!data?.items || !Array.isArray(data.items)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid data structure" });
    }

    // Prepare bulk operations
    const bulkOps = data.items.map((player) => ({
      updateOne: {
        filter: {
          playerId: player.playerId,
          category: category,
          date: formattedDate,
        },
        update: { $setOnInsert: { ...player, category, date: formattedDate } }, // Only insert if it doesn't exist
        upsert: true, // Insert if not found, ignore if already exists
      },
    }));

    const response = await Ranks.bulkWrite(bulkOps);

    return res.status(200).json({
      status: true,
      message: "Data Stored Successfully",
      insertedCount: response.upsertedCount,
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
  // (async () => {
  //   try {
  //     await Ranks.syncIndexes(); // Ensures missing indexes are created
  //     console.log("Indexes synced successfully!");
  //   } catch (error) {
  //     console.error("Error syncing indexes:", error);
  //   }
  // })();
  try {
    const category = req.params.category;
    const page = parseInt(req.params.page) || 1;
    const limit=100; //static value 
    const skip = (page - 1) * limit;

    const total = await Ranks.countDocuments({ category });

    const data = await Ranks.find({ category })
      .sort({ rank: 1 }) 
      .skip(skip)
      .limit(100);

    if (!data.length) {
      return res.status(200).json({
        status: false,
        message: "No data found",
        ranks: [],
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    }

    res.status(200).json({
      status: true,
      message: "Ranks retrieved successfully!",
      ranks:data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "An unknown error occurred. Please try again later.",
      error: err.message,
    });
  }
});

exports.ITFCalendarSave = catchAsync(async (req, res, next) => {
  try {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.goto(
      "https://www.itftennis.com/tennis/api/TournamentApi/GetCalendar?circuitCode=WT&searchString=&skip=0&take=304&nationCodes=&zoneCodes=&dateFrom=2025-01-01&dateTo=2025-12-31&indoorOutdoor=&categories=&isOrderAscending=true&orderField=startDate&surfaceCodes=",
      { waitUntil: "networkidle2", timeout: 60000 }
    );

    let data = await page.evaluate(() => document.body.innerText);
    data = JSON.parse(data);

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
