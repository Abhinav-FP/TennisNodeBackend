const Ranks = require("../db/ranks");
const Calendar = require("../db/calendar");
const catchAsync = require("../utils/catchAsync");
const puppeteer = require("puppeteer");
const axios = require("axios");
const cheerio = require("cheerio");

const keyMappings = {
  MENS: "MT",
  WOMENS: "WT",
  JUNIORS: "JT",
  MASTERS: "VT",
  BEACH: "BT",
  WHEELCHAIR: "WCT",
};

exports.RanksSave = catchAsync(async (req, res, next) => {
  try {
    const circuit = req?.body?.category?.toUpperCase();
    if (!circuit || !keyMappings[circuit]) {
      return res.status(400).json({
        status: false,
        message: "Invalid category",
      });
    }

    const browser = await puppeteer.launch({
      headless: "new", // or true/false depending on your use case
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    const category = keyMappings[circuit];

    let url = "";
    let Gender = null,
      TournamentType = null,
      Age = null,
      MatchType = null;

    if (category === "MT" || category === "WT") {
      // Men and woman category data
      url = `https://www.itftennis.com/tennis/api/PlayerRankApi/GetPlayerRankings?circuitCode=${category}&matchTypeCode=S&ageCategoryCode=&take=6000&isOrderAscending=true`;
    } else if (category === "VT") {
      // Masters
      ({ Gender, TournamentType, Age, MatchType } = req.body);
      if (!Gender || !Age || !MatchType) {
        return res.status(400).json({
          status: false,
          message: "Please send Gender, Age and Match type",
        });
      }
      url = `https://www.itftennis.com/tennis/api/PlayerRankApi/GetPlayerRankings?circuitCode=${category}&playerTypeCode=${Gender}&matchTypeCode=${MatchType}&ageCategoryCode=${Age}&seniorRankingType=${
        TournamentType || "ITF"
      }&take=6000&isOrderAscending=true`;
    } else if (category === "BT") {
      // Beach
      ({ Gender } = req.body);
      if (!Gender) {
        return res.status(400).json({
          status: false,
          message: "Gender is required",
        });
      }
      url = `https://www.itftennis.com/tennis/api/PlayerRankApi/GetPlayerRankings?circuitCode=${category}&playerTypeCode=${Gender}&ageCategoryCode=&take=6000&isOrderAscending=true`;
    } else if (category === "WCT") {
      // WheelChair
      ({ Gender, MatchType } = req.body);
      if (!Gender || !MatchType) {
        return res.status(400).json({
          status: false,
          message: "Please send Gender and Match type",
        });
      }
      url = `https://www.itftennis.com/tennis/api/PlayerRankApi/GetPlayerRankings?circuitCode=${category}&playerTypeCode=${Gender}&matchTypeCode=${MatchType}&ageCategoryCode=&take=6000&isOrderAscending=true`;
    } else if (category === "JT") {
      // Case for Juniors Rank (JT)
      ({ Gender, TournamentType } = req.body);
      if (!Gender || !TournamentType) {
        return res.status(400).json({
          status: false,
          message: "Please send Gender and Tournament type",
        });
      }
      url = `https://www.itftennis.com/tennis/api/PlayerRankApi/GetPlayerRankings?circuitCode=${category}&playerTypeCode=${Gender}&ageCategoryCode=&juniorRankingType=${TournamentType}&take=6000&isOrderAscending=true`;
    }

    await page.goto(url, { waitUntil: "networkidle2", timeout: 90000 });

    let data = await page.evaluate(() => document.body.innerText);
    data = JSON.parse(data);

    await browser.close();

    if (category) data.category = circuit;
    if (Gender) data.Gender = Gender;
    if (TournamentType) data.TournamentType = TournamentType;
    if (Age) data.Age = Age;
    if (MatchType) data.MatchType = MatchType;

    return res.status(200).json({
      status: true,
      message: "Data retrieved successfully",
      data: data,
    });

    // Code for saving in mongodb
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
    const bulkOps = data.items.map((player) => {
      let playerData = { ...player, category, date: formattedDate };

      if (Gender) playerData.Gender = Gender;
      if (TournamentType) playerData.TournamentType = TournamentType;
      if (Age) playerData.Age = Age;
      if (MatchType) playerData.MatchType = MatchType;

      return {
        updateOne: {
          filter: {
            playerId: player.playerId,
            category: category,
            date: formattedDate,
            Gender: Gender,
            TournamentType: TournamentType,
            Age: Age,
            MatchType: MatchType,
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
    console.log("error", error);
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
    let { category, page, TournamentType, Age, Gender, MatchType } = req.query;

    page = parseInt(page) || 1;
    const limit = 100;
    const skip = (page - 1) * limit;

    const filter = {};
    if (category) filter.category = category;
    if (
      TournamentType &&
      TournamentType !== "null" &&
      TournamentType !== "undefined" &&
      TournamentType !== ""
    ) {
      filter.TournamentType = TournamentType;
    }
    if (Age && Age !== "null" && Age !== "undefined" && Age !== "") {
      filter.Age = Age;
    }
    if (
      Gender &&
      Gender !== "null" &&
      Gender !== "undefined" &&
      Gender !== ""
    ) {
      filter.Gender = Gender;
    }
    if (
      MatchType &&
      MatchType !== "null" &&
      MatchType !== "undefined" &&
      MatchType !== ""
    ) {
      filter.MatchType = MatchType;
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

exports.CalendarSave = catchAsync(async (req, res, next) => {
  try {
    const circuit = req?.body?.category?.toUpperCase();
    if (!circuit || !keyMappings[circuit]) {
      return res.status(400).json({
        status: false,
        message: "Invalid category",
      });
    }
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    await page.goto(
      `https://www.itftennis.com/tennis/api/TournamentApi/GetCalendar?circuitCode=${keyMappings[circuit]}&searchString=&skip=0&take=250&nationCodes=&zoneCodes=&dateFrom=2026-01-01&dateTo=2026-12-31&indoorOutdoor=&categories=&isOrderAscending=true&orderField=startDate&surfaceCodes=`,
      { waitUntil: "networkidle2", timeout: 90000 }
    );

    let data = await page.evaluate(() => document.body.innerText);
    data = JSON.parse(data);
    // console.log("totalItems", data?.totalItems);
    let totalItems = data?.totalItems || 0;
    if (totalItems > 250) {
      let totalpages = Math.ceil(totalItems / 250);
      for (let i = 1; i < totalpages; i++) {
        let skip = 250 * i;
        // console.log("skip", skip);
        await page.goto(
          `https://www.itftennis.com/tennis/api/TournamentApi/GetCalendar?circuitCode=${keyMappings[circuit]}&searchString=&skip=${skip}&take=250&nationCodes=&zoneCodes=&dateFrom=2026-01-01&dateTo=2026-12-31&indoorOutdoor=&categories=&isOrderAscending=true&orderField=startDate&surfaceCodes=`,
          { waitUntil: "networkidle2", timeout: 90000 }
        );
        let data1 = await page.evaluate(() => document.body.innerText);
        data1 = JSON.parse(data1);
        data.items = [...data.items, ...data1.items];
      }
    }

    await browser.close();

    if (!data?.items || !Array.isArray(data.items)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid data structure" });
    }
    return res.status(200).json({
      status: true,
      message: "Calendar fetched successfully",
      totalItems: data.items.length,
      items: data.items,
    });
    // const bulkOps = data.items.map((player) => {
    //   return {
    //     updateOne: {
    //       filter: {
    //         tournamentKey: player.tournamentKey,
    //       },
    //       update: { $setOnInsert: player },
    //       upsert: true, // Insert if not found, ignore if already exists
    //     },
    //   };
    // });

    // const response = await Calendar.bulkWrite(bulkOps);

    // return res.status(200).json({
    //   status: true,
    //   message: "Data Stored Successfully",
    //   insertedCount: response.upsertedCount,
    // });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "An error occurred.",
      error: error.message,
    });
  }
});

exports.CalendarGet = catchAsync(async (req, res, next) => {
  try {
    let { page, category } = req.query;

    page = parseInt(page) || 1;
    const limit = 100;
    const skip = (page - 1) * limit;

    const filter = {};
    if (category) filter.tennisCategoryCode = category;

    const total = await Calendar.countDocuments(filter);
    const data = await Calendar.find(filter).sort({ startDate: 1 });
    // .skip(skip)
    // .limit(limit);

    return res.status(200).json({
      status: true,
      message: data.length
        ? "Tournaments retrieved successfully!"
        : "No data found",
      tournaments: data,
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

// exports.RanksUniqueGet = catchAsync(async (req, res, next) => {
//   try {
//     const data = await Ranks.aggregate([
//       {
//         $match: { category: { $exists: true, $ne: null } } // Ensure category exists
//       },
//       {
//         $group: {
//           _id: "$category", // Group by category
//           doc: { $first: "$$ROOT" } // Pick the lowest-ranked document per category
//         }
//       },
//       {
//         $replaceRoot: { newRoot: "$doc" } // Restore original document format
//       },
//     ]).allowDiskUse(true); // ✅ Enables external sorting when needed

//     return res.status(200).json({
//       status: true,
//       message: "Ranks retrieved successfully!",
//       ranks: data,
//     });
//   } catch (err) {
//     return res.status(500).json({
//       status: false,
//       message: "An unknown error occurred. Please try again later.",
//       error: err.message,
//     });
//   }
// });
