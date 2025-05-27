const mongoose = require("mongoose");

const atpEmailsSchema = new mongoose.Schema({
  tournamentId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  formattedDate: {
    type: String,
    required: true
  },
  isLive: {
    type: Boolean,
    default: false
  },
  isPastEvent: {
    type: Boolean,
    default: false
  },
  scoresUrl: {
    type: String
  },
  drawsUrl: {
    type: String
  },
  tournamentSiteUrl: {
    type: String
  },
  scheduleUrl: {
    type: String
  },
  type: {
    type: String,
    required: true
  },
  singlesDrawPrintUrl: {
    type: String
  },
  doublesDrawPrintUrl: {
    type: String
  },
  qualySinglesDrawPrintUrl: {
    type: String
  },
  schedulePrintUrl: {
    type: String
  },
  countryFlagUrl: {
    type: String
  },
  badgeUrl: {
    type: String
  },
  tournamentOverviewUrl: {
    type: String
  },
  ticketHotline: {
    type: String,
    default: null
  },
  ticketsUrl: {
    type: String
  },
  ticketsPackageUrl: {
    type: String,
    default: null
  },
  phoneNumber: {
    type: String,
    default: ""
  },
  email: {
    type: String,
    default: null
  },
  eventTypeDetail: {
    type: Number
  },
  totalFinancialCommitment: {
    type: String
  },
  prizeMoneyDetails: {
    type: String
  },
  surface: {
    type: String
  },
  indoorOutdoor: {
    type: String
  },
  sglDrawSize: {
    type: Number
  },
  dblDrawSize: {
    type: Number
  },
  eventType: {
    type: String
  },
  challengerCategory: {
    type: String,
    default: null
  }
});

const AtpEmails = mongoose.model("AtpEmails", atpEmailsSchema);

module.exports = AtpEmails;