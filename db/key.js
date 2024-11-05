const mongoose = require("mongoose");

const keyschema = mongoose.Schema({
  value: {
    type: String,
  },
});

module.exports = mongoose.model("Key", keyschema);