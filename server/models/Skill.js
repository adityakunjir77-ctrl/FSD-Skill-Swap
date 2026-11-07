const mongoose = require('mongoose');

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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Skill', skillSchema);
