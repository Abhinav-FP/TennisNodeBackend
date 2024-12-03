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

exports.processPdf = (url, sub_category, category) => {
  let girlsValue=[];
  return new Promise(async (resolve, reject) => {
    // console.log("Inside pdf Services",url)
    const valid = await isValidUrl(url);
    if (!valid) {
      console.log(`Invalid URL: ${url}`);
      return reject(new Error("Ranks not Available"));
    }

    let reader;


    try {
      reader = new PdfDataReader({ url });
      // console.log("reader",reader);
    } catch (error) {
      console.log(`Failed to initialize PDF reader for URL: ${url}`);
      return reject(new Error("Failed to initialize PDF reader"));
    }



    let rows = [];
    reader.on("data", (row) => {
      function mergeNames(inputArray) {
        // Check if the array has at least 3 elements and the first two are alphabetic strings
        if (inputArray.length >= 3 && isAlphabetic(inputArray[1]) && isAlphabetic(inputArray[2])) {
          // Merge the first and second elements into a single element
          const mergedName = `${inputArray[1]} ${inputArray[2]}`;
          // Construct a new array with the merged name and the rest of the elements
          return [inputArray[0], mergedName, ...inputArray.slice(3)];
        } else {
          // If no merging is needed, return the original array
          return inputArray;
        }
      }
      
      function isAlphabetic(str) {
        return /^[A-Za-z\s]+$/.test(str);
      }
      const value1 = mergeNames(row);
      const value = mergeNames(value1);
      // console.log(value);
      const lastValue = value[value.length - 1];
      girlsValue.push(lastValue);
      rows.push(value);
    });

    reader.on("end", () => {

      logger.info("Finished processing PDF");

      if (rows.length === 0) {
        return reject(new Error("No data found in PDF"));
      }

      const filteredRows = rows.filter((row) => row.length >= 9);
      // cleaned_array = [elem.strip()


      // Logic for dealing with different pdfs
      let rowsWithObj;
      if (sub_category == "u_18") {
        // logger.info(filteredRows);
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
      // console.log(rowsWithObj);
      // console.log("girlsvalue",girlsValue);
      if(category=="G" && sub_category=="u_18")
        {
          girlsValue.splice(0, 7);
        }
        // else if(category=="G" && sub_category=="u_14")
        //   {
        //     girlsValue.splice(0, 6);
        //   }
        else if((category=="B" && sub_category=="u_14") || (category=="G" && sub_category=="u_14"))
        {
          girlsValue.splice(0, 6);
        }
      if((category=="G" && sub_category=="u_18") || (category=="B" && sub_category=="u_14") || (category=="G" && sub_category=="u_14")){
        rowsWithObj.forEach((item, index) => {
          item.final = girlsValue[index];
        });
        // console.log("rowsWithObj",rowsWithObj)
      }

      resolve({
        title,
        date,
        data: rowsWithObj,
      });
    });

    reader.on("error", (err) => {
      console.log(`Error processing PDF: ${err.message}`);
      reject(new Error("Error processing PDF"));
    });
  });
};
