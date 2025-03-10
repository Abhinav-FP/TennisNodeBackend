const mongoose = require("mongoose");

const rankSchema = new mongoose.Schema({
  playerId: {
    type: Number,
    required: [true, "Player ID is required"],
    unique: true,
  },
  playerFamilyName: {
    type: String,
    required: true,
  },
  playerGivenName: {
    type: String,
    required: true,
  },
  playerNationalityCode: {
    type: String,
    required: true,
  },
  playerNationality: {
    type: String,
    required: true,
  },
  profileLink: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ["M", "F"],
    required: true,
  },
  hiddenPlayer: {
    type: Boolean,
    default: false,
  },
  birthYear: {
    type: Number,
    required: true,
  },
  rankMovement: {
    type: Number,
    default: 0,
  },
  rank: {
    type: Number,
    required: true,
    index: true, // Creates an index for faster retrieval
  },
  rankEqualFlag: {
    type: String,
    default: "",
  },
  tournamentsPlayed: {
    type: Number,
    required: true,
  },
  points: {
    type: Number,
    required: true,
  },
  profileImage: {
    type: String,
    default: "",
  },
  tournamentsPlayedSingles: {
    type: Number,
    default: null,
  },
  tournamentsPlayedDoubles: {
    type: Number,
    default: null,
  },
  pointsRankingSingles: {
    type: Number,
    default: null,
  },
  pointsRankingDoubles: {
    type: Number,
    default: null,
  },
  pointsRankingTotal: {
    type: Number,
    default: null,
  },
});

const Ranks = mongoose.model("Ranks", rankSchema);

module.exports = Ranks;