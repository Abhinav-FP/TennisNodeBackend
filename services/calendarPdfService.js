const { PdfDataReader } = require("pdf-data-parser");
const logger = require("../utils/logger");
const axios = require("axios");

const keyMappings = {
  "HON._SECRETARY_OF_ASSOCIATION": "HONY._SECRETARY_OF_ASSOCIATION",
  FLOODLIGHTS: "FLOODLIT",
  BALLS: "BALL",
  "ADDRESS_OF_VENUE":"ADDRESS_OF_THE_VENUE",
  "TELEPHONE_NO.":"TELEPHONE_NO",
  "TELEPHONE":"TELEPHONE_NO"
};

function extractArrayBetweenValues(array, lowerValue, higherValue) {
  const lowerIndex = array.findIndex((row) => row.includes(lowerValue));
  const higherIndex = array.findIndex((row) => row.includes(higherValue));

  if (lowerIndex !== -1 && higherIndex !== -1 && lowerIndex < higherIndex) {
    return array.slice(lowerIndex, higherIndex);
  } else {
    return []; // Return an empty array if the values are not found or invalid range
  }
}

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

function removeAfterDotCom(inputString) {
  const index = inputString.indexOf(".com");
  if (index !== -1) {
    return inputString.slice(0, index + 4); // Include ".com"
  }
  return inputString; // Return the original string if ".com" is not found
}

function mergeSingleValueRows(rows) {
  return rows.reduce((acc, row, index) => {
    // Filter out any empty string values in the row
    const nonEmptyValues = row.filter((value) => value !== "");

    // Check if the row contains only one non-empty value
    if (nonEmptyValues.length === 1) {
      const singleValue = nonEmptyValues[0];

      // Check if the value is "HON. SECRETARY OF" or "HONY. SECRETARY OF"
      // If true, merge it with the next row's first value by concatenating
      if (
        singleValue === "HON. SECRETARY OF" ||
        singleValue === "HONY. SECRETARY OF" ||
        singleValue === "COURT" ||
        singleValue === "NO. OF MATCH"
      ) {
        if (index < rows.length - 1) {
          const nextRow = rows[index + 1];
          // Concatenate the single value with the first value of the next row
          nextRow[0] = `${singleValue} ${nextRow[0]}`;
        }

        // Check if the single value matches specific association or contact details
        // If true, it does nothing (these values are ignored for merging purposes)
      } else if (
        singleValue === "NAME OF THE STATE ASSOCIATION" ||
        singleValue === "ADDRESS OF THE ASSOCIATION" ||
        singleValue === "TELEPHONE NO." ||
        singleValue === "EMAIL ID" ||
        singleValue === "TOURNAMENT FACTSHEET – 2024"
      ) {
        // Do nothing for these cases
        // Check if the single value needs to be inserted at the second position
        // in the next row, if the next row starts with "ADDRESS OF THE ASSOCIATION"
      } else if (
        index < rows.length - 1 &&
        rows[index + 1][0] === "ADDRESS OF THE ASSOCIATION"
      ) {
        const nextRow = rows[index + 1];
        // Insert the single value at the second position in the next row
        nextRow.splice(1, 0, singleValue);

        // For all other cases, the single value gets added to the last row in 'acc'
        // If no rows exist in 'acc', it starts a new row with the current one
      } else {
        if (acc.length > 0) {
          // Append the single value to the previous row
          acc[acc.length - 1].push(singleValue);
        } else {
          // Add the current row as a new row
          acc.push(row);
        }
      }

      // If the row contains more than one value, push it directly into the accumulator
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
      // logger.info("Finished processing PDF");
      if (rows.length === 0) {
        return reject(new Error("No data found in PDF"));
      }
      let filteredRows = rows;
      filteredRows.shift();
      let [basicInfo, remainingInfo] = splitArrayByKeyword(
        filteredRows,
        "ONLINE ENTRY SYSTEM"
      );
      if(remainingInfo.length===0){
        [basicInfo, remainingInfo] = splitArrayByKeyword(
          filteredRows,
          "ENTRY SYSTEM (ONLINE ONLY)"
        );
      }

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
        let key = innerArray[0].replaceAll(" ", "_");
        if (key === "HON._SECRETARY_OF_ASSOCIATION") {
          key = "HONY._SECRETARY_OF_ASSOCIATION";
        }
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
        let key = innerArray[0].replaceAll(" ", "_");
        if (key === "TOURNAMENT_CATREGORY") {
          key = "TOURNAMENT_CATEGORY";
        }
        const value = innerArray.slice(1).join(" ");
        if (index === 0) {
          Tour[`heading`] = key;
        }
         else {
          Tour[key] = value;
        }
      });

      // Venue Details table
      let VenueInfo = extractArrayBetweenValues(
        remainingInfo,
        "VENUE DETAILS",
        "TOURNAMENT OFFICIALS"
      );
      // console.log("VenueInfoBefore", VenueInfo);
      VenueInfo = mergeSingleValueRows(VenueInfo);
      // console.log("VenueInfo", VenueInfo);
      let Venue = {};
      VenueInfo.forEach((innerArray, index) => {
        let key = innerArray[0].replaceAll(" ", "_");
        // console.log("key",key)
        if (key === "BALLS") {
          key = "BALL";
        }
        else if (key === "ADDRESS_OF_VENUE") {
          key = "ADDRESS_OF_THE_VENUE";
        }
        else if (key === "TELEPHONE" || key === "TELEPHONE_NO.") {
          key = "TELEPHONE_NO";
        }
        else if (key === "EMAIL" || key === "EMAIL_ID") {
          key = "EMAIL_ID";
          const value = removeAfterDotCom(innerArray[1]); 
          Venue[key] = value;    
          return;     
        }
        if (index === VenueInfo.length - 1) {
          let key1 = innerArray[0].replaceAll(" ", "_");
          const value1 = innerArray[1];
          let key2 = innerArray[2].replaceAll(" ", "_");
          const value2 = innerArray[3];
          if (key1 === "FLOODLIGHTS") {
            key1 = "FLOODLIT";
          } else if (key2 === "FLOODLIGHTS") {
            key2 = "FLOODLIT";
          }
          if (key1 === "NO._OF_COURTS") {
            key1 = "NO._OF_MATCH_COURTS";
          } else if (key2 === "NO._OF_COURTS") {
            key2 = "NO._OF_MATCH_COURTS";
          }
          Venue[key1] = value1;
          Venue[key2] = value2;
        } else {
          const value = innerArray.slice(1).join(" ");
          if (index === 0) {
            Venue[`heading`] = key;
          } else {
            Venue[key] = value;
          }
        }
      });

      resolve({
        basic: basic,
        onlineEntry: OnlineEntry,
        tour: Tour,
        venue: Venue,
      });
    });
    reader.on("error", (err) => {
      logger.info(url);
      console.log(`Error processing PDF: ${err.message}`);
      reject(new Error("Error processing PDF"));
    });
  });
};
