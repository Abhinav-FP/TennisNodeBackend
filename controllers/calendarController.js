const axios = require("axios");
const cheerio = require("cheerio");
const logger = require("../utils/logger");
const calendarPdfService = require("../services/calendarPdfService");
const { JSDOM } = require("jsdom");

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

async function normalizeData(data) {
  return data.map(entry => {
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
                      link: value.link || ""
                  };
              } else if (typeof value === "string") {
                  // If it's a string, treat it as the text
                  normalizedEntry[key] = {
                      text: value,
                      link: ""
                  };
              } else {
                  // If it's empty or undefined, create an empty object
                  normalizedEntry[key] = {
                      text: "",
                      link: ""
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
    const updatedData=processTournamentData(mergedData);
    // return updatedData;
    const data=addDataField(updatedData)

    // Return the JSON data
    return data;
  } catch (error) {
    console.error("Error processing calendar data:", error);
    throw error;
  }
}

// Count function for counting academies
function extractTextEntries(data) {
  let textEntries = [];

  data.forEach(weekData => {
      for (const category in weekData) {
          const categoryData = weekData[category];
          if (categoryData && categoryData.text) {
              // Split the text by commas if there are multiple values
              const texts = categoryData.text.split(',').map(text => text.trim());
              textEntries.push(...texts);
          } else if (categoryData && categoryData.data) {
              categoryData.data.forEach(item => {
                  if (item.text) {
                      textEntries.push(item.text);
                  }
              });
          }
      }
  });

  return textEntries;
}

// Function to count occurrences of each unique text across the entire dataset
function countTextOccurrences(textEntries) {
  return textEntries.reduce((acc, text) => {
      acc[text] = (acc[text] || 0) + 1;
      return acc;
  }, {});
}

exports.getData = async (req, res) => {
  try {
    // Get the calendar data
    const currentYear = req.query.year || new Date()?.getFullYear();
    const data = await getCalendarData(currentYear);

    // Send the response with the extracted data
    res.status(200).json({
      status: true,
      message: "Extracting data success!",
      year:currentYear,
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

exports.getCounts = async (req, res) => {
  try {
    const data = await getCalendarData();
    const textEntries = extractTextEntries(data);
    const textCounts = countTextOccurrences(textEntries);
    res.status(200).json({
      status: true,
      message: "Extracting data success!",
      data: textCounts, 
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
    // Validate the request body
    const { id } = req.body;
    if (!id || typeof id !== "string") {
      return res.status(400).json({
        status: false,
        message: "The 'id' field is required and must be a string.",
      });
    }

    // Fetch HTML content from the provided URL
    const url = `https://aitatennis.com/tournament-content/?id=${id}`;
    const html = await fetchHTML(url);

    // Existing regex patterns
    const regex1 = /<a\s+[^>]*href="([^"]*storage\/data\/factsheet[^"]*)"/i;
    const regex2 = /<h4[^>]*>\s*Download\s*-\s*<a[^>]*href="([^"]+)"[^>]*>Fact\s*Sheet\s*<\/a>\s*<\/h4>/i;

    // Match using the existing regex patterns
    const match1 = html.match(regex1);
    const match2 = html.match(regex2);

    // Updated regex pattern for new link type with name
    const regex3 = /<a\s+[^>]*href="(https:\/\/aitatennis\.com\/acceptancelist\?[^"]+)"[^>]*>([^<]+)<\/a>/gi;

    // Find all matches for the new link pattern
    const list_link = [];
    let match;
    while ((match = regex3.exec(html)) !== null) {
      list_link.push({
        link: match[1],
        name: match[2].trim(), // Extract and trim the link name
      });
    }

     if (match1) {
      return res.status(200).json({
        status: true,
        message: "Links extracted successfully!",
        link: match1?.[1] || match2?.[1], // Single link from the old patterns
        list_link: list_link, // Additional links from the new pattern
      });
    }

    if (match2) {
      return res.status(200).json({
        status: false,
        message: "Links extracted successfully!",
        link: match1?.[1] || match2?.[1], // Single link from the old patterns
        list_link: list_link, // Additional links from the new pattern
      });
    }

    // If no links are found using the old patterns but found using the new pattern
    if (list_link.length > 0) {
      return res.status(200).json({
        status: true,
        message: "Links extracted successfully!",
        link: null,
        list_link: list_link,
      });
    }

    return res.status(404).json({
      status: false,
      message: "No links found.",
    });
  } catch (err) {
    // Log the error and send an error response
    console.error(`Error occurred: ${err.message}`);
    return res.status(400).json({
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

const transformRanks = (data) => {
  const rankRegex = /^RANK AS ON (\d{2}-\d{2}-\d{4})$/;

  for (const drawType in data) {
    data[drawType] = data[drawType].map((entry) => {
      const newEntry = { ...entry };

      for (const key in newEntry) {
        const match = key.match(rankRegex);
        if (match) {
          const date = match[1];
          newEntry["RANK"] = newEntry[key];
          newEntry["RANK_AS_ON"] = date;
          delete newEntry[key];
        }
      }

      return newEntry;
    });
  }

  return data;
};

exports.getAcceptanceList = async (req, res) => {
  try {
    const {link} = req.body;
    const htmlContent = await fetchHTML(link);
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;
  
    // Find all tables with id "customers1"
    const tables = document.querySelectorAll('table#customers1');
    const result = {};
  
    tables.forEach((table, index) => {
      let tableName = `Table_${index + 1}`; // Default table name
  
      // Try to get the first `<th>` value as the table name
      const firstHeader = table.querySelector("thead th");
      if (firstHeader && firstHeader.textContent.trim()) {
        tableName = firstHeader.textContent.trim();
      }
  
      const headers = [];
      const tableData = [];
  
      // Extract headers from the table
      const headerRows = table.querySelectorAll("thead tr");
      headerRows.forEach((row) => {
        const thElements = row.querySelectorAll("th");
        thElements.forEach((th) => {
          if (th.textContent.trim() && th.colSpan === 1) { // Ignore merged headers
            headers.push(th.textContent.trim());
          }
        });
      });
  
      // Extract rows from the table body
      const bodyRows = table.querySelectorAll("tbody tr");
      bodyRows.forEach((row) => {
        const rowData = {};
        const cells = row.querySelectorAll("td");
        cells.forEach((cell, index) => {
          if (index < headers.length) {
            rowData[headers[index]] = cell.textContent.trim();
          }
        });
        tableData.push(rowData);
      });
  
      // Add the parsed table to the result using table name as key
      result[tableName] = tableData;
    });
    const updatedResult = transformRanks(result);
    return  res.status(200).json({
      status: true,
      message: "Extracting data success!",
      data: updatedResult,
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