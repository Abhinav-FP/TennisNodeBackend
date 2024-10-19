const { PdfDataReader } = require("pdf-data-parser");
const logger = require("../utils/logger");
const axios = require("axios");

function splitArrayByKeyword(arr, keyword) {
  const index = arr.findIndex((subArr) => subArr.includes(keyword));

  if (index === -1) {
    // Return original array as the keyword was not found
    return [arr, []];
  }

  // Split array into two parts
  const beforeKeyword = arr.slice(0, index);
  const afterKeyword = arr.slice(index);

  return [beforeKeyword, afterKeyword];
}
function mergeSingleValueRows(rows) {
  return rows.reduce((acc, row, index) => {
    // Remove empty strings from the row
    const nonEmptyValues = row.filter((value) => value !== "");

    // If the row contains only 1 non-empty value, merge it with the previous row
    if (nonEmptyValues.length === 1 && acc.length > 0) {
      acc[acc.length - 1].push(nonEmptyValues[0]);
    } else {
      acc.push(row);
    }

    return acc;
  }, []);
}

function mergeFirstTwoArrays(arr) {
  if (arr.length < 2) {
    return arr; // If there are less than two arrays, return the array as is
  }

  // Merge the 0th and 1st array
  const mergedArray = [arr[1][0], ...arr[0], ...arr[1].slice(1)];

  // Replace the 1st index with the merged array and remove the 0th array
  arr.splice(0, 2, mergedArray);

  return arr;
}

function splitArrayBySingleValue(arr) {
  let firstPart = [];
  let secondPart = [];
  let foundBreak = false;

  arr.forEach((subArray, index) => {
    if (index === 0) {
      // Always push the first array (index 0)
      firstPart.push(subArray);
    } else if (!foundBreak && subArray.length === 1) {
      // If a single-value array is encountered, set foundBreak to true
      foundBreak = true;
      secondPart.push(subArray);
    } else if (foundBreak) {
      // After the break point, add elements to secondPart
      secondPart.push(subArray);
    } else {
      // Before the break point, add elements to firstPart
      firstPart.push(subArray);
    }
  });

  return [firstPart, secondPart];
}


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
  let girlsValue = [];
  return new Promise(async (resolve, reject) => {
    const valid = await isValidUrl(url);
    if (!valid) {
      console.log(`Invalid URL: ${url}`);
      return reject(new Error("Invalid URL"));
    }
    let reader;
    try {
      reader = new PdfDataReader({ url });
    } catch (error) {
      console.log(`Failed to initialize PDF reader for URL: ${url}`);
      return reject(new Error("Failed to initialize PDF reader"));
    }
    let rows = [];
    reader.on("data", (row) => {
      const value = row;
      const lastValue = value[value.length - 1];
      girlsValue.push(lastValue);
      rows.push(value);
    });
    reader.on("end", () => {
      logger.info("Finished processing PDF");
      if (rows.length === 0) {
        return reject(new Error("No data found in PDF"));
      }
      let filteredRows = rows;
      filteredRows.shift();
      // console.log("filteredRows", filteredRows);
      let [basicInfo, remainingInfo] = splitArrayByKeyword(
        filteredRows,
        "ONLINE ENTRY SYSTEM"
      );

      // First table on the page
      basicInfo = mergeSingleValueRows(basicInfo);

      const targetArray = ["MSLTA All India Ranking Championship Series"];
      if (
        basicInfo[0] &&
        basicInfo[0].length === targetArray.length &&
        basicInfo[0].every((val, index) => val === targetArray[index])
      ) {
        basicInfo = mergeFirstTwoArrays(basicInfo);
      }
      let basic = {};
      basicInfo.forEach((innerArray) => {
        const key = innerArray[0].replaceAll(" ","-");
        const value = innerArray.slice(1).join(" ");
        basic[key] = value;
      });

      // Second table online entry on the page
      let OnlineEntryInfo;
      [OnlineEntryInfo, remainingInfo] = splitArrayByKeyword(
        remainingInfo,
        "TOUR INFO"
      );
      const keys = ["heading", "text", "link", "info"];
      let OnlineEntry = {};
      OnlineEntryInfo.forEach((innerArray, index) => {
        if (keys[index]) {
          OnlineEntry[keys[index]] = innerArray.join(" ");
        }
      });

      //  Third table Tour Info on the page
      let TourInfo;
      [TourInfo, remainingInfo] = splitArrayBySingleValue(remainingInfo);
      // console.log("remainingInfo",remainingInfo);
      let Tour = {};
      TourInfo.forEach((innerArray, index) => {
        const key = innerArray[0].replaceAll(" ","-");
        const value = innerArray.slice(1).join(" ");
        if (index === 0) {
          Tour[`heading`] = key;
        } else {
          Tour[key] = value;
        }
      });
      // console.log("Tour", Tour);

      resolve({
        basic: basic,
        onlineEntry: OnlineEntry,
        tour:Tour,
      });
    });
    reader.on("error", (err) => {
      console.log(`Error processing PDF: ${err.message}`);
      reject(new Error("Error processing PDF"));
    });
  });
};
