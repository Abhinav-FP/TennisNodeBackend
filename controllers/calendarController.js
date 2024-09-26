const axios = require('axios'); // Remove the duplicate import
const cheerio = require('cheerio');
const logger = require('../utils/logger'); // Assuming you have a logger utility

// Function to fetch the HTML from the given URL
async function fetchHTML(url) {
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    console.error('Error fetching the HTML:', error);
    throw error;
  }
}

// Function to strip everything above the 'tableFixHead' div and return the table HTML
function extractTableHTML(html) {
  const $ = cheerio.load(html);
  // Extract the content of the div with class "tableFixHead"
  const tableDiv = $('.tableFixHead').html();
  return tableDiv;
}

// Function to convert the table to JSON
function tableToJSON(tableHTML) {
  const $ = cheerio.load(tableHTML);
  const headers = [];
  const rows = [];

  // Get the headers
  $('thead th').each((i, elem) => {
    headers.push($(elem).text().trim());
  });

  // Get the rows
  $('tbody tr').each((i, row) => {
    const rowData = {};
    $(row).find('td').each((i, cell) => {
      const link = $(cell).find('a').attr('href') || ''; // Get the link if exists
      const text = $(cell).text().trim(); // Get the text inside the cell
      rowData[headers[i]] = link ? { text, link } : text; // Include the link if present
    });
    rows.push(rowData);
  });

  return rows;
}

// Main function to get and process the calendar data
async function getCalendarData() {
  const url = 'https://aitatennis.com/management/calendar.php?year=2024';
  
  try {
    // Fetch the HTML from the website
    const html = await fetchHTML(url);

    // Extract the table HTML
    const tableHTML = extractTableHTML(html);

    // Convert the table to JSON
    const jsonData = tableToJSON(tableHTML);

    // Return the JSON data
    return jsonData;
  } catch (error) {
    console.error('Error processing calendar data:', error);
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
      message: 'Extracting data success!',
      data: data,  // Include the extracted data in the response
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
