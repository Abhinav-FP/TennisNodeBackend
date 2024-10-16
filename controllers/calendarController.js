const axios = require("axios"); // Remove the duplicate import
const cheerio = require("cheerio");
const logger = require("../utils/logger"); // Assuming you have a logger utility
const moment = require("moment");

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
    const year = "2024"; // Assuming all are from 2024 as per the example.
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

async function fetchHTML(url) {
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    console.error("Error fetching the HTML:", error);
    throw error;
  }
}

// Function to strip everything above the 'tableFixHead' div and return the table HTML
function extractTableHTML(html) {
  const $ = cheerio.load(html);
  // Extract the content of the div with class "tableFixHead"
  const tableDiv = $(".tableFixHead").html();
  return tableDiv;
}

// Function to convert the table to JSON
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

// Main function to get and process the calendar data
async function getCalendarData() {
  const url = "https://aitatennis.com/management/calendar.php?year=2024";

  try {
    // Fetch the HTML from the website
    const html = await fetchHTML(url);

    // Extract the table HTML
    const tableHTML = extractTableHTML(html);

    // Convert the table to JSON
    const jsonData = tableToJSON(tableHTML);
    const mergedData = mergeWeeks(jsonData);

    // Return the JSON data
    return mergedData;
  } catch (error) {
    console.error("Error processing calendar data:", error);
    throw error;
  }
}

// Controller function to handle the request
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
