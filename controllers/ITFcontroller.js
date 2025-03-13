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

    let url = "";
    let JuniorsGender = null, JuniorsTournament = null, BeachGender=null;

    if (category === "MT" || category === "WT") {
      // Men and woman category data
      url = `https://www.itftennis.com/tennis/api/PlayerRankApi/GetPlayerRankings?circuitCode=${category}&matchTypeCode=S&ageCategoryCode=&take=6000&isOrderAscending=true`;
    } else if (category === "VT") {
      // Masters
      url = `https://www.itftennis.com/tennis/api/PlayerRankApi/GetPlayerRankings?circuitCode=${category}&playerTypeCode=M&matchTypeCode=S&ageCategoryCode=V30&seniorRankingType=ITF&take=6000&isOrderAscending=true`;
    } else if (category === "BT") {
      // Beach
      ({ BeachGender } = req.body);
      if (!BeachGender) {
        return res.status(400).json({
          status: false,
          message: "Gender is required",
        });
      }
      url = `https://www.itftennis.com/tennis/api/PlayerRankApi/GetPlayerRankings?circuitCode=${category}&playerTypeCode=${BeachGender}&ageCategoryCode=&take=6000&isOrderAscending=true`;
    } else if (category === "WCT") {
      // WheelChair
      url = `https://www.itftennis.com/tennis/api/PlayerRankApi/GetPlayerRankings?circuitCode=${category}&playerTypeCode=M&matchTypeCode=S&ageCategoryCode=&take=6000&isOrderAscending=true`;
    } else if (category === "JT") {
      // Case for Juniors Rank (JT)
      ({ JuniorsGender, JuniorsTournament } = req.body);
      if (!JuniorsGender || !JuniorsTournament) {
        return res.status(400).json({
          status: false,
          message: "Please send JuniorsGender and JuniorsTournament",
        });
      }
      url = `https://www.itftennis.com/tennis/api/PlayerRankApi/GetPlayerRankings?circuitCode=${category}&playerTypeCode=${JuniorsGender}&ageCategoryCode=&juniorRankingType=${JuniorsTournament}&take=6000&isOrderAscending=true`;
    }

    await page.goto(url, { waitUntil: "networkidle2", timeout: 90000 });

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
      return res.status(400).json({ status: false, message: "Invalid data structure" });
    }

    // Prepare bulk operations
    const bulkOps = data.items.map((player) => {
      let playerData = { ...player, category, date: formattedDate };
      
      if (category === "JT") {
        playerData.JuniorsGender = JuniorsGender;
        playerData.JuniorsTournament = JuniorsTournament;
      }
      else if(category === "BT"){
        playerData.BeachGender = BeachGender;
      }

      return {
        updateOne: {
          filter: {
            playerId: player.playerId,
            category: category,
            date: formattedDate,
            JuniorsTournament:JuniorsTournament,
            BeachGender:BeachGender,
          },
          update: { $setOnInsert: playerData },
          upsert: true, // Insert if not found, ignore if already exists
        },
      };
    });

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
  //     res.status(200).json({
  //       status:true,
  //       message:"Indexes synced successfully"
  //     })
  //   } catch (error) {
  //     console.error("Error syncing indexes:", error);
  //   }
  // })();
  try {
    let { category, page, juniorsGender, JuniorsTournament, BeachGender } = req.query;
    console.log("juniorsGender",juniorsGender);

    page = parseInt(page) || 1;  
    const limit = 100;
    const skip = (page - 1) * limit;

    const filter = {};
    if (category) filter.category = category;
    if (juniorsGender && juniorsGender !== "null" && juniorsGender !== "undefined" && juniorsGender !== "") {
      filter.JuniorsGender = juniorsGender;
    }
    if (JuniorsTournament && JuniorsTournament !== "null" && JuniorsTournament !== "undefined" && JuniorsTournament !== "") {
      filter.JuniorsTournament = JuniorsTournament;
    }
    if (BeachGender && BeachGender !== "null" && BeachGender !== "undefined" && BeachGender !== "") {
      filter.BeachGender = BeachGender;
    }

    const total = await Ranks.countDocuments(filter);
    const data = await Ranks.find(filter)
      .sort({ rank: 1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      status: true,
      message: data.length ? "Ranks retrieved successfully!" : "No data found",
      ranks: data,
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
