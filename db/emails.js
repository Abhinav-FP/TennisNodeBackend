const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  link: {
    type: String,
    required: [true, "Link is required"],
  },
  category: {
    type: String,
    required: [true, "Category is required"],
  },
  date: {
    type:String,
    required: [true, "Date is required"],
  },
  type: {
    type:String,
    required: [true, "Type is required"],
  },
  factsheet: {
    type:String,
    default:null,
  },
  email: {
    type:String,
    default:null,
  },
});

const Emails = mongoose.model("Emails", emailSchema);

module.exports = Emails;