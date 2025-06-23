const mongoose = require("mongoose");

const bniSchema = new mongoose.Schema({
  uuid: { type: String, default: null },

  // Basic info from search result
  coordinates: String,
  country: String,
  city: String,
  state: String,
  category: String,
  speciality: String,
  score: Number,
  rank: Number,
  connected: Boolean,
  user_id: Number,
  first_name: String,
  last_name: String,
  chapter_name: String,
  company_name: String,
  profile_image_id: String,
  profile_url: String,
  chapter_id: Number,
  membership_status_id: Number,
  membership_status: String,

  // Additional profile details
  userId: { type: mongoose.Schema.Types.Mixed, default: null },
  title: String,
  displayName: String,
  profileImageId: String,
  roleInfo: String,
  phoneNumber: String,
  home: { type: mongoose.Schema.Types.Mixed, default: null },
  directNumber: { type: mongoose.Schema.Types.Mixed, default: null },
  pagerNumber: { type: mongoose.Schema.Types.Mixed, default: null },
  voicemailNumber: { type: mongoose.Schema.Types.Mixed, default: null },
  tollfreeNumber: { type: mongoose.Schema.Types.Mixed, default: null },
  faxNumber: String,
  emailAddress: String,
  websiteUrl: { type: mongoose.Schema.Types.Mixed, default: null },
  networkLinks: {
    "network.connections.connectiondetails.linkedin": String,
  },
  primaryCategory: String,
  secondaryCategory: String,
  companyName: String,
  mobileNumber: { type: mongoose.Schema.Types.Mixed, default: null },
  business: String,
  keywords: String,
  firstName: String,
  lastName: String,
  suffix: { type: mongoose.Schema.Types.Mixed, default: null },
  gender: { type: mongoose.Schema.Types.Mixed, default: null },
  userName: { type: mongoose.Schema.Types.Mixed, default: null },
  language: { type: mongoose.Schema.Types.Mixed, default: null },
  timezone: { type: mongoose.Schema.Types.Mixed, default: null },

  address: {
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    country: String,
    postcode: String,
    countryName: String,
  },

  billingAddress: { type: mongoose.Schema.Types.Mixed, default: null },
  displayAddressOnPublicProfile: { type: mongoose.Schema.Types.Mixed, default: null },
  quickCopyAddress: { type: mongoose.Schema.Types.Mixed, default: null },
  emailVerificationText: { type: mongoose.Schema.Types.Mixed, default: null },
  networkOptions: { type: mongoose.Schema.Types.Mixed, default: null },
  memberChapter: String,
  memberChapterId: Number,
  mspStatus: Boolean,
  titles: { type: mongoose.Schema.Types.Mixed, default: null },
  selectedTitle: { type: mongoose.Schema.Types.Mixed, default: null },
  ownProfile: Boolean,
  memberId: { type: mongoose.Schema.Types.Mixed, default: null },
  accountBlockedMessage: { type: mongoose.Schema.Types.Mixed, default: null },
  emailVerified: Boolean,
  accountBlocked: Boolean,
  canEditName: Boolean,
  emailBlocked: Boolean,
}, {
  timestamps: true
});

const BNIs = mongoose.model("BNIs", bniSchema);

module.exports = BNIs;
