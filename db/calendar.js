const mongoose = require("mongoose");

const calendarSchema = new mongoose.Schema({
  tournamentName: {
    type: String,
    required: [true, "Tournament Name is required"],
  },
  dates: {
    type: String,
    required: [true, "Dates are required"],
  },
  location: {
    type: String,
    default: null,
  },
  category: {
    type: String,
    required: [true, "Category is required"],
  },
  prizeMoney: {
    type: String,
    default: null,
  },
  liveLink: {
    type: String,
    default: null,
  },
  surfaceDesc: {
    type: String,
    default: null,
  },
  surfaceCode: {
    type: String,
    default: null,
  },
  tourStatusCode: {
    type: String,
    default: null,
  },
  tourStatusDesc: {
    type: String,
    default: null,
  },
  indoorOrOutDoor: {
    type: String,
    default: null,
  },
  isRecognised: {
    type: Boolean,
    default: false,
  },
  recognisedTournamentLink: {
    type: String,
    default: null,
  },
  id: {
    type: Number,
    required: [true, "ID is required"],
  },
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  promotionalName: {
    type: String,
    required: [true, "Promotional Name is required"],
  },
  hostNation: {
    type: String,
    required: [true, "Host Nation is required"],
  },
  hostNationCode: {
    type: String,
    default: null,
  },
  venue: {
    type: String,
    required: [true, "Venue is required"],
  },
  startDate: {
    type: Date,
    required: [true, "Start Date is required"],
  },
  endDate: {
    type: Date,
    required: [true, "End Date is required"],
  },
  tournamentKey: {
    type: String,
    required: [true, "Tournament Key is required"],
    unique: true,
  },
  tennisCategoryCode: {
    type: String,
    default: null,
  },
  tournamentLink: {
    type: String,
    default: null,
  },
  hospitality: {
    type: String,
    default: null,
  },
  year: {
    type: Number,
    default: null,
  },
  liveStreamingUrl: {
    type: String,
    default: null,
  },
});

calendarSchema.index({ tennisCategoryCode: 1 }); 
const Calendar = mongoose.model("Calendar", calendarSchema);

module.exports = Calendar;