const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      type: String,
      enum: ['student', 'admin', 'super-admin'],
      default: 'student',
    },
    avatarUrl: String,
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
      },
    ],
    canteen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Canteen',
    },
    lastLoginAt: Date,
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

userSchema.methods.matchPassword = async function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function preSave(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
