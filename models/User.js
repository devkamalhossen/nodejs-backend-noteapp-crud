const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      required: true,
    },
    interests: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// for search optimization
userSchema.index({ interests: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);