const logger = require("./logger");

exports.errorHandler = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).json({ error: err.message });
};
