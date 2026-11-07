const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
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
    skillsOffered: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
      },
    ],
    skillsWanted: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
      },
    ],
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

module.exports = mongoose.model('User', userSchema);
