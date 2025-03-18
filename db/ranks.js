const mongoose = require("mongoose");

const rankSchema = new mongoose.Schema({
  playerId: {
    type: Number,
    required: [true, "Player ID is required"],
  },
  playerFamilyName: {
    type: String,
    required: [true, "Player Family Name is required"],
  },
  playerGivenName: {
    type: String,
    required: [true, "Player Given Name is required"],
  },
  playerNationalityCode: {
    type: String,
    required: [true, "Player Nationality Code is required"],
  },
  playerNationality: {
    type: String,
    required: [true, "Player Nationality is required"],
  },
  profileLink: {
    type: String,
    required: [true, "Profile Link is required"],
  },
  gender: {
    type: String,
    enum: ["M", "F"],
    required: [true, "Gender is required"],
  },
  hiddenPlayer: {
    type: Boolean,
    default: false,
  },
  birthYear: {
    type: Number,
    required: [true, "Birth Year is required"],
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    index: true,
  },
  rankMovement: {
    type: Number,
    default: 0,
  },
  rank: {
    type: Number,
    required: [true, "Rank is required"],
    index: true,
  },
  rankEqualFlag: {
    type: String,
    default: "",
  },
  tournamentsPlayed: {
    type: Number,
    required: [true, "Tournaments Played is required"],
  },
  points: {
    type: Number,
    required: [true, "Points are required"],
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
  date: {
    type: Date,
    required: [true, "Please send a valid date"],
  },
  Gender: {
    type:String,
    default:null,
  },
  TournamentType: {
    type:String,
    default:null,
  },
  Age: {
    type:String,
    default:null,
  },
  MatchType: {
    type:String,
    default:null,
  },
});

// ✅ Add the unique compound index here
rankSchema.index({ playerId: 1, category: 1, date: 1, Gender: 1, TournamentType: 1, Age:1, MatchType:1}, { unique: true });

const Ranks = mongoose.model("Ranks", rankSchema);

module.exports = Ranks;