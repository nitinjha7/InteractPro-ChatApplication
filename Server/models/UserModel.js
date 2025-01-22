const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: false
    },

    lastName: {
        type: String,
        required: false
    },

    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true
    },

    password: {
        type: String,
        required: [true, 'Please provide a password']
    },

    image: {
        type: String,
        required: false
    },

    color: {
        type: Number,
        required: false
    },

    profileSetup: {
        type: Boolean,
        default: false
    },
});

userSchema.pre('save', async function(next) {
      if (!this.isModified("password")) {
        // Only hash if password is modified
        return next();
      }
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('User', userSchema);