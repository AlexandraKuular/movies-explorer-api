const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');
const { errorMessages } = require('../utils/constants');

require('dotenv').config();

const { JWT_SECRET = 'JWT_SECRET', NODE_ENV } = process.env;

const User = require('../models/user');

module.exports.getMe = (req, res, next) => {
  const { _id } = req.user;
  User.find({ _id })
    .then((user) => {
      if (!user) {
        next(new NotFoundError(errorMessages.userNotFound));
      }
      return res.send(...user);
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const { name, email, password } = req.body;

  const createUser = (hash) => User.create({
    name,
    email,
    password: hash,
  });

  const findOne = (hash) => User.findOne({ email }).then((user) => ({ user, hash }));

  bcrypt
    .hash(password, 10)
    .then(findOne)
    .then(({ user, hash }) => {
      if (user) {
        throw new ConflictError(errorMessages.createUser);
      }
      return createUser(hash);
    })
    .then((user) => {
      const { _id } = user;
      res.send({
        _id,
        name,
        email,
      });
    })
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictError(errorMessages.createUser));
      } else next(err);
    });
};

module.exports.updateProfile = (req, res, next) => {
  const { name, email } = req.body;

  const findAndUpdate = () => User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    { runValidators: true },
  );

  User.find({ email })
    .then(([user]) => {
      if (user && user._id.toString() !== req.user._id) {
        throw new ConflictError(errorMessages.updateProfile);
      }
      return findAndUpdate();
    })
    .then(() => {
      res.send({
        name,
        email,
      });
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'JWT_SECRET',
        {
          expiresIn: '7d',
        },
      );

      res.cookie('jwt', token, {
        maxAge: 3600000,
        httpOnly: true,
        secure: true,
        sameSite: 'None',
      });
      res.send({ token });
    })
    .catch(next);
};

module.exports.logout = (req, res) => {
  res.cookie('jwt', '', {
    maxAge: 0,
    httpOnly: true,
    secure: true,
    sameSite: 'None',
  });
  res.clearCookie('jwt');
  return res.send({ message: 'logout - ok!' });
};
