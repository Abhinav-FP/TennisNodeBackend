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
  JuniorsGender: {
    type:String,
    default:null,
    enum: ['B', 'G'],
  },
  JuniorsTournament: {
    type:String,
    default:null,
    enum: ['itf', 'chengu', 'year'],
  },
  BeachGender: {
    type:String,
    default:null,
    enum: ['B', 'G'],
  }
});

// ✅ Add the unique compound index here
rankSchema.index({ playerId: 1, category: 1, date: 1, JuniorsTournament: 1, BeachGender: 1}, { unique: true });

const Ranks = mongoose.model("Ranks", rankSchema);

module.exports = Ranks;