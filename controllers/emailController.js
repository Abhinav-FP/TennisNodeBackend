const catchAsync = require("../utils/catchAsync");
const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const Emails = require("../db/emails");
const Calendar = require("../db/calendar");
const AtpEmails = require('../db/atpEmails');
const calendarPdfService = require("../services/calendarPdfService");
const puppeteerExtra = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteerExtra.use(StealthPlugin());

function mergeWeeks(data) {
  const mergedData = {};

  // Helper function to convert "dd mmm" to "dd-mm-yyyy"
  function convertWeekFormat(weekStr) {
    const [day, month] = weekStr.split(",");
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthIndex = monthNames.indexOf(month.trim()) + 1;
    const year = "2026"; // Assuming all are from 2026 as per the example.
    return `${monthIndex.toString().padStart(2, "0")}-${day.padStart(
      2,
      "0"
    )}-${year}`;
  }

  // Helper function to convert keys with spaces to underscores
  function replaceSpacesWithUnderscores(obj) {
    const newObj = {};
    Object.keys(obj).forEach((key) => {
      const newKey = key.replace(/ /g, "_"); // Replace spaces with underscores
      newObj[newKey] = obj[key];
    });
    return newObj;
  }

  data.forEach((entry) => {
    const week = convertWeekFormat(entry.WEEK);
    // console.log("week",week);

    if (!mergedData[week]) {
      mergedData[week] = replaceSpacesWithUnderscores(
        JSON.parse(JSON.stringify(entry))
      ); // Deep copy and replace spaces in keys
      mergedData[week].WEEK = week; // Update WEEK to the new format
    } else {
      const categories = Object.keys(entry);
      categories.forEach((category) => {
        if (category !== "WEEK") {
          const newCategory = category.replace(/ /g, "_"); // Replace spaces with underscores
          if (entry[category].text && entry[category].text !== "") {
            if (mergedData[week][newCategory].text) {
              mergedData[week][newCategory].text += `, ${entry[category].text}`;
            } else {
              mergedData[week][newCategory].text = entry[category].text;
            }

            // Only merge links if both the existing and new entry have non-empty text
            if (mergedData[week][newCategory].text && entry[category].text) {
              if (mergedData[week][newCategory].link) {
                mergedData[week][
                  newCategory
                ].link += `, ${entry[category].link}`;
              } else {
                mergedData[week][newCategory].link = entry[category].link;
              }
            }
          }
        }
      });
    }
  });

  return Object.values(mergedData);
}

function addDataField(data) {
  return data.map((weekEntry) => {
    const updatedWeekEntry = { ...weekEntry }; // Create a shallow copy of the week entry

    Object.keys(weekEntry).forEach((key) => {
      if (key !== "WEEK") {
        const { text, link } = weekEntry[key];

        if (text || (text && link)) {
          const textArray = text ? text.split(", ").map((t) => t.trim()) : [];
          const linkArray = link ? link.split(", ").map((l) => l.trim()) : [];

          // Ensure the length of data entries matches the longer array
          const length = Math.max(textArray.length, linkArray.length);
          const dataArray = Array.from({ length }, (_, i) => ({
            link: linkArray[i] || "", // Use an empty string if link is missing
            text: textArray[i] || "", // Use an empty string if text is missing
          }));

          updatedWeekEntry[key] = { ...weekEntry[key], data: dataArray };
        }
      }
    });

    return updatedWeekEntry;
  });
}

function processTournamentData(data) {
  return data.map((entry) => {
    const processedEntry = { WEEK: entry.WEEK }; // Keep the week information intact.

    Object.keys(entry).forEach((category) => {
      if (category === "WEEK") return; // Skip the WEEK field.

      const { text, link } = entry[category];

      if (text && text.trim() !== "") {
        // Process only if text is non-empty.
        const textArray = text.split(",").map((item) => item.trim());
        const linkArray =
          typeof link === "string" // Check if link is a string
            ? link
                .split(",")
                .map((item) =>
                  item.trim().replace("tournament-content?id=", "")
                )
            : [];

        // If text and link lengths are not equal, trim the extra links.
        if (textArray.length !== linkArray.length) {
          const excessLinks = linkArray.length - textArray.length;
          linkArray.splice(0, excessLinks); // Remove links from the beginning.
        }

        // Add the processed category back to the result.
        processedEntry[category] = {
          text: textArray.join(", "), // Rejoin the array into a string.
          link: linkArray.join(", "), // Rejoin the processed links into a string.
        };
      } else {
        // Preserve categories with empty text as they are.
        processedEntry[category] = {
          text: text,
          link:
            typeof link === "string"
              ? link
                  .split(",")
                  .map((item) =>
                    item.trim().replace("tournament-content?id=", "")
                  )
                  .join(",") // Remove the prefix.
              : "", // Handle non-string links.
        };
      }
    });

    return processedEntry; // Return the processed entry.
  });
}

async function normalizeData(data) {
  return data.map((entry) => {
    // Iterate over each key in the entry
    const normalizedEntry = {};
    for (const key in entry) {
      if (key === "WEEK") {
        // Copy the WEEK field as is
        normalizedEntry[key] = entry[key];
      } else {
        // Normalize the other fields
        const value = entry[key];
        if (typeof value === "object" && value !== null) {
          // If it's already an object, ensure it has text and link
          normalizedEntry[key] = {
            text: value.text || "",
            link: value.link || "",
          };
        } else if (typeof value === "string") {
          // If it's a string, treat it as the text
          normalizedEntry[key] = {
            text: value,
            link: "",
          };
        } else {
          // If it's empty or undefined, create an empty object
          normalizedEntry[key] = {
            text: "",
            link: "",
          };
        }
      }
    }
    return normalizedEntry;
  });
}

async function fetchHTML(url) {
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    console.error("Error fetching the HTML:", error);
    throw error;
  }
}

function extractTableHTML(html) {
  const $ = cheerio.load(html);
  // Extract the content of the div with class "tableFixHead"
  const tableDiv = $(".tableFixHead").html();
  return tableDiv;
}

function tableToJSON(tableHTML) {
  const $ = cheerio.load(tableHTML);
  const headers = [];
  const rows = [];

  // Get the headers
  $("thead th").each((i, elem) => {
    headers.push($(elem).text().trim());
  });

  // Get the rows
  $("tbody tr").each((i, row) => {
    const rowData = {};
    $(row)
      .find("td")
      .each((i, cell) => {
        const link = $(cell).find("a").attr("href") || ""; // Get the link if exists
        const text = $(cell).text().trim(); // Get the text inside the cell
        rowData[headers[i]] = link ? { text, link } : text; // Include the link if present
      });
    rows.push(rowData);
  });

  return rows;
}

async function getCalendarData(currentYear) {
  const url = `https://aitatennis.com/management/calendar.php?year=${currentYear}`;

  try {
    const html = await fetchHTML(url);

    const tableHTML = extractTableHTML(html);

    const jsonData = tableToJSON(tableHTML);
    // return jsonData;
    const normalisedData = await normalizeData(jsonData);
    const mergedData = mergeWeeks(normalisedData);
    // return mergedData;
    const updatedData = processTournamentData(mergedData);
    // return updatedData;
    const data = addDataField(updatedData);

    // Return the JSON data
    return data;
  } catch (error) {
    console.error("Error processing calendar data:", error);
    throw error;
  }
}

const FactSheetLink = async (id) => {
  try {
    if (!id || typeof id !== "string") {
      return res.status(400).json({
        status: false,
        message: "The 'id' field is required and must be a string.",
      });
    }

    const url = `https://aitatennis.com/tournament-content/?id=${id}`;
    const html = await fetchHTML(url);

    // Existing regex patterns
    const regex1 = /<a\s+[^>]*href="([^"]*storage\/data\/factsheet[^"]*)"/i;
    const regex2 =
      /<h4[^>]*>\s*Download\s*-\s*<a[^>]*href="([^"]+)"[^>]*>Fact\s*Sheet\s*<\/a>\s*<\/h4>/i;

    // Match using the existing regex patterns
    const match1 = html.match(regex1);
    const match2 = html.match(regex2);
    if (match1) {
      return match1?.[1] || match2?.[1];
    }
    if (match2) {
      return match1?.[1] || match2?.[1];
    }
    return null;
  } catch (err) {
    console.error(`Error occurred: ${err.message}`);
    return null;
  }
};

exports.saveData = catchAsync(async (req, res) => {
  try {
    const currentYear = new Date()?.getFullYear();
    const data = await getCalendarData(currentYear);

    const categories = [
      "Under_10",
      "Under_12",
      "Under_14",
      "Under_16",
      "Under_18",
      "Men",
      "Women",
      "Senior",
    ];

    const entriesToInsert = [];

    data.forEach((entry) => {
      const week = entry.WEEK;

      categories.forEach((category) => {
        const categoryData = entry[category];
        if (categoryData && Array.isArray(categoryData.data)) {
          categoryData.data.forEach((item) => {
            entriesToInsert.push({
              name: item.text,
              link: item.link,
              category: category,
              date: week,
              type: "AITA",
            });
          });
        }
      });
    });

    // Bulk insert into MongoDB
    if (entriesToInsert.length > 0) {
      await Emails.insertMany(entriesToInsert, { ordered: false });
    }

    return res.status(200).json({
      status: true,
      message: "Data processed and saved successfully",
      savedCount: entriesToInsert.length,
    });
  } catch (error) {
    console.error("Error saving emails:", error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
});

exports.addFactsheet = catchAsync(async (req, res) => {
  try {
    const data = await Emails.find({});

    if (!data || data.length === 0) {
      return res.status(200).json({
        status: false,
        message: "No emails found",
      });
    }

    const updatePromises = data.map(async (entry) => {
      const factsheetValue = await FactSheetLink(entry.link);
      return Emails.findByIdAndUpdate(
        entry._id,
        { factsheet: factsheetValue },
        { new: true }
      );
    });

    const updatedEntries = await Promise.all(updatePromises);

    return res.status(200).json({
      status: true,
      message: "Factsheets updated successfully",
      updatedCount: updatedEntries.length,
      data: updatedEntries,
    });
  } catch (error) {
    console.error("Error updating factsheets:", error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
});

exports.addEmail = catchAsync(async (req, res) => {
  try {
    const data = await Emails.find({});
    if (!data || data.length === 0) {
      return res.status(200).json({
        status: false,
        message: "No emails found",
      });
    }
    const updatePromises = data.map(async (entry) => {
      // Skip if factsheet starts with "https://www.itftennis.com"
      if (
        entry.factsheet &&
        (entry.factsheet.startsWith("https://www.itftennis.com") ||
          entry.factsheet.startsWith("https://www.atptour.com") ||
          entry.factsheet.startsWith("https://www.atf.hitcourt.com"))
      ) {
        return null;
      }
      const factsheetValue = await calendarPdfService.processPdf(
        entry.factsheet
      );
      return Emails.findByIdAndUpdate(
        entry._id,
        { email: factsheetValue?.basic?.EMAIL_ID || "" },
        { new: true }
      );
    });
    const updatedEntries = await Promise.all(updatePromises);
    return res.status(200).json({
      status: true,
      message: "Factsheets updated successfully",
      updatedCount: updatedEntries.length,
      data: updatedEntries,
    });
  } catch (error) {
    console.error("Error updating factsheets:", error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
});

exports.getEmail = catchAsync(async (req, res) => {
  try {
    const data = await Emails.find({ type: "AITA" }).select("-_id -__v");
    if (!data || data.length === 0) {
      return res.status(200).json({
        status: false,
        message: "No emails found",
      });
    }
    return res.status(200).json({
      status: true,
      message: "Data retrieved successfully",
      data: data,
    });
  } catch (error) {
    console.error("Error updating factsheets:", error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
});

exports.saveITFCalendar = catchAsync(async (req, res) => {
  try {
    const today = new Date();
    const oneMonthFromToday = new Date();
    oneMonthFromToday.setMonth(today.getMonth() + 1);

    const data = await Calendar.find({
      startDate: {
        $gte: today,
        $lte: oneMonthFromToday,
      },
    }).sort({ startDate: 1 });

    if (!data || data.length === 0) {
      return res.status(200).json({
        status: false,
        message: "No data found",
      });
    }

    // Save each item to Emails collection
    const emailDocs = await Promise.all(
      data.map((item) => {
        return Emails.create({
          name: item.tournamentName,
          link: item.tournamentLink,
          category: item.tennisCategoryCode,
          date: item.startDate,
          type: "ITF",
        });
      })
    );

    return res.status(200).json({
      status: true,
      message: "Data retrieved and saved to Emails successfully",
      data: emailDocs,
    });
  } catch (error) {
    console.error("Error updating factsheets:", error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
});

exports.itfAddEmail = catchAsync(async (req, res) => {
  try {
    const data = await Emails.find({ type: "ITF" }).select("-__v");

    if (!data || data.length === 0) {
      return res.status(200).json({
        status: false,
        message: "No emails found",
      });
    }

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    for (const entry of data) {
      const tournamentUrl = `https://www.itftennis.com${entry.link}`;

      try {
        await page.goto(tournamentUrl, {
          waitUntil: "networkidle2",
          timeout: 90000,
        });

        const email = await page.evaluate(() => {
          const emailLink = document.querySelector('a[href^="mailto:"]');
          return emailLink ? emailLink.textContent.trim() : null;
        });

        if (email) {
          await Emails.updateOne({ link: entry.link }, { $set: { email } });
          console.log(`Updated email for ${entry.name}: ${email}`);
        } else {
          console.log(`No email found for ${entry.name}`);
        }
      } catch (err) {
        console.error(`Error processing ${entry.name}: ${err.message}`);
      }
    }

    await browser.close();

    return res.status(200).json({
      status: true,
      message: "Email extraction and update complete",
    });
  } catch (error) {
    console.error("Error during bulk email extraction:", error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
});

exports.itfGetEmail = catchAsync(async (req, res) => {
  try {
    const data = await Emails.find({ type: "ITF" }).select("-_id -__v");
    if (!data || data.length === 0) {
      return res.status(200).json({
        status: false,
        message: "No data found",
      });
    }

    const updatedData = data.map((item) => ({
      ...item.toObject(),
      link: `https://www.itftennis.com${item.link}`,
    }));

    return res.status(200).json({
      status: true,
      message: "Data retrieved successfully",
      data: updatedData,
    });
  } catch (error) {
    console.error("Error updating factsheets:", error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
});

exports.saveATPCalendar = catchAsync(async (req, res) => {
  try {
    const url = "https://www.atptour.com/en/-/tournaments/calendar/tour";

    const browser = await puppeteerExtra.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    await page.setUserAgent('PostmanRuntime/7.44.0');
    await page.setExtraHTTPHeaders({
      'Cache-Control': 'no-cache',
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
    });

    await page.setCookie({
      name: '__cf_bm',
      value: '<your_cookie_value>',
      domain: '.atptour.com',
      path: '/',
      httpOnly: true,
      secure: true,
    });

    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 90000,
    });

    const html = await page.content();
    await browser.close();

    const match = html.match(/<pre[^>]*>(.*?)<\/pre>/s);
    if (!match || !match[1]) {
      throw new Error("JSON not found in <pre> tag");
    }

    const jsonData = JSON.parse(match[1]);
    const events = jsonData?.TournamentDates || [];
    // console.log("Sample event:", events[0]);

    await AtpEmails.deleteMany({}); // caution: this deletes all

    // Insert each event
   const formatted = [];

  events.forEach(event => {
    if (Array.isArray(event.Tournaments)) {
      event.Tournaments.forEach(t => {
        formatted.push({
          tournamentId: t.Id,
          name: t.Name,
          location: t.Location,
          formattedDate: t.FormattedDate,
          isLive: t.IsLive,
          isPastEvent: t.IsPastEvent,
          scoresUrl: t.ScoresUrl,
          drawsUrl: t.DrawsUrl,
          tournamentSiteUrl: t.TournamentSiteUrl,
          scheduleUrl: t.ScheduleUrl,
          type: t.Type,
          singlesDrawPrintUrl: t.SinglesDrawPrintUrl,
          doublesDrawPrintUrl: t.DoublesDrawPrintUrl,
          qualySinglesDrawPrintUrl: t.QualySinglesDrawPrintUrl,
          schedulePrintUrl: t.SchedulePrintUrl,
          countryFlagUrl: t.CountryFlagUrl,
          badgeUrl: t.BadgeUrl,
          tournamentOverviewUrl: t.TournamentOverviewUrl,
          ticketHotline: t.TicketHotline || null,
          ticketsUrl: t.TicketsUrl,
          ticketsPackageUrl: t.TicketsPackageUrl || null,
          phoneNumber: t.PhoneNumber || "",
          email: t.Email || null,
          eventTypeDetail: t.EventTypeDetail,
          totalFinancialCommitment: t.TotalFinancialCommitment,
          prizeMoneyDetails: t.PrizeMoneyDetails,
          surface: t.Surface,
          indoorOutdoor: t.IndoorOutdoor,
          sglDrawSize: t.SglDrawSize,
          dblDrawSize: t.DblDrawSize,
          eventType: t.EventType,
          challengerCategory: t.ChallengerCategory || null,
        });
      });
    }
  });

    await AtpEmails.insertMany(formatted);

    return res.status(200).json({
      status: true,
      message: "ATP calendar data saved successfully.",
      data: formatted,
    });
  } catch (error) {
    console.error("Error saving ATP calendar:", error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
});

exports.ATPGetEmail = catchAsync(async (req, res) => {
  try {
    const data = await AtpEmails.find()
    .select("tournamentId name location formattedDate tournamentSiteUrl scheduleUrl tournamentOverviewUrl phoneNumber email prizeMoneyDetails surface eventType -_id");

    if (!data || data.length === 0) {
      return res.status(200).json({
        status: false,
        message: "No data found",
      });
    }
    const updatedData = data.map((item) => ({
      ...item.toObject(),
      scheduleUrl: `https://www.atptour.com${item.scheduleUrl}`,
      tournamentOverviewUrl: `https://www.atptour.com${item.tournamentOverviewUrl}`,
    }));

    return res.status(200).json({
      status: true,
      message: "Data retrieved successfully",
      data: updatedData,
    });
  } catch (error) {
    console.error("Error updating factsheets:", error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
});