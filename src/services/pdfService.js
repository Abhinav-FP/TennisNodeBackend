const { PdfDataReader } = require("pdf-data-parser");
const logger = require("../utils/logger");
const axios = require("axios");

const keyMappings = {
  "Name of the Player": "NAME OF PLAYER",
  "Given Name Family Name": "NAME OF PLAYER",
  "D.O.B": "DOB",
  "REG.NO": "REG NO.",
  // "PTS.": "Final",
  // "NAME OF PLAYER": "PlayerName",
};

const standardizeKeys = (row, headerRow) => {
  const obj = {};
  headerRow.forEach((header, index) => {
    const standardizedKey = keyMappings[header] || header;
    obj[standardizedKey] = row[index];
  });
  return obj;
};
//  const link="https://www.google.co.in/";
const isValidUrl = async (url) => {
  try {
    const response = await axios.head(url);
    return response.status === 200;
  } catch (err) {
    // console.log("err",err)
    return false;
  }
};

exports.processPdf = (url) => {
  return new Promise(async (resolve, reject) => {
    // console.log("Inside pdf Services",url)
    const valid = await isValidUrl(url);
    if (!valid) {
      logger.error(`Invalid URL: ${url}`);
      return reject(new Error("Invalid URL"));
    }

    let reader;
    try {
      reader = new PdfDataReader({ url });
    } catch (error) {
      logger.error(`Failed to initialize PDF reader for URL: ${url}`);
      return reject(new Error("Failed to initialize PDF reader"));
    }

    let rows = [];

    reader.on("data", (row) => {
      logger.debug(`Row data: ${JSON.stringify(row)}`);
      rows.push(row);
    });

    reader.on("end", () => {
      logger.info("Finished processing PDF");

      if (rows.length === 0) {
        return reject(new Error("No data found in PDF"));
      }

      const filteredRows = rows.filter((row) => row.length >= 9);

      const rowsWithObj = filteredRows
        .slice(1)
        .map((row) => standardizeKeys(row, filteredRows[0]));

      const title = rows[0][0];
      const date = rows[1][0];

      resolve({
        title,
        date,
        data: rowsWithObj,
      });
    });

    reader.on("error", (err) => {
      logger.error(`Error processing PDF: ${err.message}`);
      reject(new Error("Error processing PDF"));
    });
  });
};
