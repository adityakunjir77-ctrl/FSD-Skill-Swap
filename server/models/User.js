const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const EMAIL_MAX_LENGTH = 254;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
const MAX_SKILLS_PER_LIST = 20;

const maxItems = (limit) => ({
  validator: (value) => !Array.isArray(value) || value.length <= limit,
  message: `A profile can list at most ${limit} skills here`,
});

const isAllowedAvatarUrl = (value) => {
  if (!value) return true;
  if (value.startsWith('/')) return !/^\/[/\\]/.test(value);

  try {
    return new URL(value).protocol === 'https:';
  } catch (error) {
    return false;
  }
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [EMAIL_MAX_LENGTH, `Email cannot exceed ${EMAIL_MAX_LENGTH} characters`],
      // Each part excludes the character that ends it, so matching stays linear.
      // The old nested-quantifier pattern backtracked exponentially on long input.
      match: [EMAIL_PATTERN, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    avatar: {
      type: String,
      default: '',
      maxlength: [500, 'Avatar URL cannot exceed 500 characters'],
      validate: {
        validator: isAllowedAvatarUrl,
        message: 'Avatar must be an https:// URL or a same-site path',
      },
    },
    bio: {
      type: String,
      default: 'Hello! I am excited to exchange skills on SkillSwap.',
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    location: {
      type: String,
      default: 'Remote',
      maxlength: [100, 'Location cannot exceed 100 characters'],
    },
    experienceLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Intermediate',
    },
    availability: {
      type: String,
      default: 'Weekends & Evenings',
      maxlength: [100, 'Availability cannot exceed 100 characters'],
    },
    skillsOffered: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
      validate: maxItems(MAX_SKILLS_PER_LIST),
    },
    skillsWanted: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
      validate: maxItems(MAX_SKILLS_PER_LIST),
    },
    averageRating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    completedExchanges: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Match candidates: a compound index can hold only one array field, so offered
// and wanted skills need separate indexes. Plus the admin list, newest first.
userSchema.index({ isActive: 1, role: 1, skillsOffered: 1 });
userSchema.index({ isActive: 1, role: 1, skillsWanted: 1 });
userSchema.index({ createdAt: -1, _id: -1 });

module.exports = mongoose.model('User', userSchema);
module.exports.EMAIL_MAX_LENGTH = EMAIL_MAX_LENGTH;
module.exports.MAX_SKILLS_PER_LIST = MAX_SKILLS_PER_LIST;
