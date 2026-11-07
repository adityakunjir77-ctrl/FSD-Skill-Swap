// Everything another person may see about a user. Allowlisted so that email,
// role and account state stay private, including for any field added later.
const PUBLIC_PROFILE_FIELDS =
  'name avatar bio location experienceLevel availability skillsOffered skillsWanted ' +
  'averageRating totalReviews completedExchanges createdAt';

// Populated onto chats, exchanges and sessions, where only a summary is needed.
const USER_SUMMARY_FIELDS = 'name avatar location averageRating experienceLevel';

module.exports = { PUBLIC_PROFILE_FIELDS, USER_SUMMARY_FIELDS };
