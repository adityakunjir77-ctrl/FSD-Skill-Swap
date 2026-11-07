const mongoose = require('mongoose');

const exchangeRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    offeredSkill: {
      type: String,
      required: [true, 'Please specify the skill you are offering to teach'],
      maxlength: [100, 'Skill name cannot exceed 100 characters'],
    },
    wantedSkill: {
      type: String,
      required: [true, 'Please specify the skill you want to learn'],
      maxlength: [100, 'Skill name cannot exceed 100 characters'],
    },
    message: {
      type: String,
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
      default: 'I would love to exchange skills with you on SkillSwap!',
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ExchangeRequest', exchangeRequestSchema);
