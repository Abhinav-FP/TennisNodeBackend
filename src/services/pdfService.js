const { PdfDataReader } = require("pdf-data-parser");
const logger = require("../utils/logger");
const axios = require("axios");

const keyMappings = {
  RANK: "rank",
  "NAME OF PLAYER": "name",
  "Name of the Player": "name",
  "Given Name Family Name": "name",
  "REG.NO": "reg_no",
  "REG NO.": "reg_no",
  "D.O.B": "dob",
  DOB: "dob",
  STATE: "state",
  "PTS.": "points",
  "LATE WL": "late_wl",
  Final: "final",
};

const keyMappings_U_18 = {
  RANK: "rank",
  "NAME OF PLAYER": "name",
  "Name of the Player": "name",
  "Given Name Family Name": "name",
  "REG.NO": "reg_no",
  "REG NO.": "reg_no",
  "D.O.B": "dob",
  DOB: "dob",
  STATE: "state",
  "PTS.": "final",
  "LATE WL": "late_wl",
  Final: "final",
};

const keyMappings_Singles = {
  RANK: "rank",
  "NAME OF PLAYER": "name",
  "Name of the Player": "name",
  "Given Name Family Name": "name",
  "REG.NO": "reg_no",
  "REG NO.": "reg_no",
  "REG.NO":"reg_no",
  "D.O.B": "dob",
  DOB: "dob",
  STATE: "state",
  "PTS.": "final",
  "LATE WL": "late_wl",
  Final: "final",

};

const keyMappings_Doubles = {
  RANK: "rank",
  "NAME OF PLAYER": "name",
  "Name of the Player": "name",
  "Given Name Family Name": "name",
  "REG NO.": "reg_no",
  "REG.NO":"reg_no",
  "D.O.B": "dob",
  DOB: "dob",
  STATE: "state",
  "PTS.": "final",
  "LATE WL": "late_wl",
  Final: "final",
};


const standardizeKeys = (row, headerRow) => {
  const obj = {};
  headerRow.forEach((header, index) => {
    const standardizedKey = keyMappings[header] || header;
    obj[standardizedKey] = row[index];
  });
  return obj;
};

const standardizeKeys_U_18 = (row, headerRow) => {
  const obj = {};
  headerRow.forEach((header, index) => {
    const standardizedKey = keyMappings_U_18[header] || header;
    obj[standardizedKey] = row[index];
  });
  return obj;
};

const standardizeKeys_Singles = (row, headerRow) => {
  const obj = {};
  headerRow.forEach((header, index) => {
    const standardizedKey = keyMappings_Singles[header] || header;
    obj[standardizedKey] = row[index];
  });
  return obj;
};

const standardizeKeys_Doubles = (row, headerRow) => {
  const obj = {};
  headerRow.forEach((header, index) => {
    const standardizedKey = keyMappings_Doubles[header] || header;
    obj[standardizedKey] = row[index];
  });
  return obj;
};

const isValidUrl = async (url) => {
  try {
    const response = await axios.head(url);
    return response.status === 200;
  } catch (err) {
    // console.log("err",err)
    return false;
  }
};

exports.processPdf = (url, sub_category) => {
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

      // Logic for dealing with different pdfs
      let rowsWithObj;
      if (sub_category == "u_18") {
        rowsWithObj = filteredRows
          .slice(1)
          .map((row) => standardizeKeys_U_18(row, filteredRows[0]));
      } else if (sub_category == "s") {
        rowsWithObj = filteredRows
          .slice(1)
          .map((row) => standardizeKeys_Singles(row, filteredRows[0]));
      } else if (sub_category == "d") {
        rowsWithObj = filteredRows
          .slice(1)
          .map((row) => standardizeKeys_Doubles(row, filteredRows[0]));
      } else {
        rowsWithObj = filteredRows
          .slice(1)
          .map((row) => standardizeKeys(row, filteredRows[0]));
      }

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
