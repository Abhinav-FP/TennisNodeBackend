const app = require("./src/app.js");
// const logger = require("./utils/logger");

const port = process.env.PORT || 5000;





// function mergeNames(inputArray) {
//   // Check if the array has at least 3 elements and the first two are alphabetic strings
//   if (inputArray.length >= 3 && isAlphabetic(inputArray[1]) && isAlphabetic(inputArray[2])) {
//     // Merge the first and second elements into a single element
//     const mergedName = `${inputArray[1]} ${inputArray[2]}`;
//     // Construct a new array with the merged name and the rest of the elements
//     return [inputArray[0], mergedName, ...inputArray.slice(3)];
//   } else {
//     // If no merging is needed, return the original array
//     return inputArray;
//   }
// }

// function isAlphabetic(str) {
//   return /^[A-Za-z]+$/.test(str);
// }



// console.log(mergeNames(['379','RUSHIKESH','BARAVE','428733','04-Oct-05','(MH)',4,0,0,4]));











app.listen(port, () => {
  // logger.info(`Server listening at http://localhost:${port}`);
  console.log(`Server listening at http://localhost:${port}`);
});