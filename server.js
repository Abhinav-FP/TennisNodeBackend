const app = require("./src/app.js");
// const logger = require("./utils/logger");

const port = process.env.PORT || 5000;

app.listen(port, () => {
  // logger.info(`Server listening at http://localhost:${port}`);
  console.log(`Server listening at http://localhost:${port}`);
});