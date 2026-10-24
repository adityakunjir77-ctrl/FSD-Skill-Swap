const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
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
