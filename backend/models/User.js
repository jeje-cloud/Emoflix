const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// models/user.js
const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    history: [{
      emotion: { type: String, required: true },
      movies: [{
        id: { type: Number, required: true },
        title: { type: String, required: true },
        poster_path: { type: String },
        vote_average: { type: Number },
        overview: { type: String },
        release_date: { type: String }
      }],
      timestamp: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Test', userSchema);
