const axios = require("axios");
const cheerio = require("cheerio");
const logger = require("../utils/logger");
const calendarPdfService = require("../services/calendarPdfService");

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
    const year = "2025"; // Assuming all are from 2024 as per the example.
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

        if (text && link) {
          const textArray = text.split(", ").map((t) => t.trim());
          const linkArray = link.split(", ").map((l) => l.trim());

          // Ensure lengths are equal before creating the data array
          const length = Math.min(textArray.length, linkArray.length);
          const dataArray = Array.from({ length }, (_, i) => ({
            link: linkArray[i],
            text: textArray[i],
          }));

          updatedWeekEntry[key] = { ...weekEntry[key], data: dataArray };
        }
      }
    });

    return updatedWeekEntry;
  });
}

function processTournamentData(data) {
  return data.map(entry => {
    const processedEntry = { WEEK: entry.WEEK }; // Keep the week information intact.

    Object.keys(entry).forEach(category => {
      if (category === "WEEK") return; // Skip the WEEK field.

      const { text, link } = entry[category];
      
      if (text && text.trim() !== "") { // Process only if text is non-empty.
        const textArray = text.split(",").map(item => item.trim());
        const linkArray = typeof link === "string" // Check if link is a string
          ? link.split(",").map(item => item.trim().replace("tournament-content?id=", ""))
          : [];

        // If text and link lengths are not equal, trim the extra links.
        if (textArray.length !== linkArray.length) {
          const excessLinks = linkArray.length - textArray.length;
          linkArray.splice(0, excessLinks); // Remove links from the beginning.
        }

        // Add the processed category back to the result.
        processedEntry[category] = {
          text: textArray.join(", "), // Rejoin the array into a string.
          link: linkArray.join(", ") // Rejoin the processed links into a string.
        };
      } else {
        // Preserve categories with empty text as they are.
        processedEntry[category] = {
          text: text,
          link: typeof link === "string"
            ? link.split(",").map(item => item.trim().replace("tournament-content?id=", "")).join(",") // Remove the prefix.
            : "" // Handle non-string links.
        };
      }
    });

    return processedEntry; // Return the processed entry.
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

async function getCalendarData() {
  const url = "https://aitatennis.com/management/calendar.php?year=2025";

  try {
    const html = await fetchHTML(url);

    const tableHTML = extractTableHTML(html);

    const jsonData = tableToJSON(tableHTML);
    const mergedData = mergeWeeks(jsonData);
    const updatedData=processTournamentData(mergedData);
    const data=addDataField(updatedData)

    // Return the JSON data
    return data;
  } catch (error) {
    console.error("Error processing calendar data:", error);
    throw error;
  }
}

exports.getData = async (req, res) => {
  try {
    // Get the calendar data
    const data = await getCalendarData();

    // Send the response with the extracted data
    res.status(200).json({
      status: true,
      message: "Extracting data success!",
      data: data, // Include the extracted data in the response
    });
  } catch (err) {
    // Log the error and send the error response
    logger.error(`Request failed: ${err.message}`);
    res.status(400).json({
      status: false,
      message: err.message,
    });
  }
};

exports.FactSheetLink = async (req, res) => {
  try {
    const { id } = req.body;
    const url = `https://aitatennis.com/tournament-content/?id=${id}`;
    const html = await fetchHTML(url);
    const regex = /<a\s+[^>]*href="([^"]*storage\/data\/factsheet[^"]*)"/i;
    const match = html.match(regex);
    res.status(200).json({
      status: true,
      message: "Link extracted successfully!",
      link: match[1],
    });
  } catch (err) {
    // Log the error and send the error response
    logger.error(`Request failed: ${err.message}`);
    res.status(400).json({
      status: false,
      message: err.message,
    });
  }
};

exports.extractcalendarData = async (req, res) => {
  try {
    const { url } = req.body;
    // console.log("req.body", req.body);
    if (!url) {
      return res
        .status(400)
        .json({ status: "fail", message: "URL parameter is required" });
    }
    // logger.info(`Received request to process PDF from URL: ${url}`);
    const result = await calendarPdfService.processPdf(url);
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
