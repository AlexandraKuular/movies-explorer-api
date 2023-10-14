const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const isEmail = require('validator/lib/isEmail');
const UnauthorizedError = require('../errors/UnauthorizedError');
const { errorMessages } = require('../utils/constants');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minLength: 2,
      maxLength: 30,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      dropDups: true,
      validate: {
        validator: (link) => isEmail(link),
        message: errorMessages.incorrectEmail,
      },
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  { versionKey: false },
);

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }, { runValidators: true })
    .select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(
          new UnauthorizedError(errorMessages.incorrectData),
        );
      }
      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          return Promise.reject(
            new UnauthorizedError(errorMessages.incorrectData),
          );
        }
        return user;
      });
    });
};

module.exports = mongoose.model('User', userSchema);
