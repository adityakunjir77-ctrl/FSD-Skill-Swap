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
    },
    wantedSkill: {
      type: String,
      required: [true, 'Please specify the skill you want to learn'],
    },
    message: {
      type: String,
      trim: true,
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
