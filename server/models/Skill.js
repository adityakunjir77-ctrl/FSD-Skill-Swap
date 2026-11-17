const mongoose = require('mongoose');
const { buildSearchTokens, normalizeName } = require('../utils/searchTokens');
const { exactNameRegex } = require('../utils/sanitize');

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
      maxlength: [100, 'Skill name cannot exceed 100 characters'],
      unique: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Programming',
        'Web Development',
        'Mobile Development',
        'UI/UX Design',
        'Graphic Design',
        'Languages',
        'Marketing',
        'Photography',
        'Video Editing',
        'Music',
        'Business',
        'Other',
      ],
      default: 'Other',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Skill description cannot exceed 500 characters'],
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    // Derived from name (see utils/searchTokens): normalizedName for exact
    // lookups ignoring case and spacing, searchTokens for prefix search
    normalizedName: {
      type: String,
      select: false,
    },
    searchTokens: {
      type: [String],
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Admin catalog, newest first
skillSchema.index({ createdAt: -1, _id: -1 });
// Public skill list, A-Z, optionally by category
skillSchema.index({ name: 1, _id: 1 });
skillSchema.index({ category: 1, name: 1, _id: 1 });
// Exact-name lookups when users add skills, and prefix search
skillSchema.index({ normalizedName: 1 });
skillSchema.index({ searchTokens: 1 });

// Finds a skill by name ignoring case and spacing, using the normalizedName
// index. Skills saved before normalizedName existed are matched by the older
// case-insensitive comparison, which only runs when the indexed lookup misses.
skillSchema.statics.findByName = async function (name) {
  const normalized = normalizeName(name);
  if (normalized) {
    const found = await this.findOne({ normalizedName: normalized });
    if (found) return found;
  }
  return this.findOne({ name: exactNameRegex(String(name).trim()) });
};

// Runs on create, save and insertMany, so every write path keeps them current
skillSchema.pre('validate', function (next) {
  if (this.isNew || this.isModified('name')) {
    this.normalizedName = normalizeName(this.name);
    this.searchTokens = buildSearchTokens(this.name);
  }
  next();
});

module.exports = mongoose.model('Skill', skillSchema);
