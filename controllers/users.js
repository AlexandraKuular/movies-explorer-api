const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ErrorCode = require('../errors/errorCode');
const ErrorNotFoundCode = require('../errors/errorNotFoundCode');
const ConflictError = require('../errors/conflictError');

require('dotenv').config();

const { JWT_SECRET, NODE_ENV } = process.env;

module.exports.addUser = async (req, res, next) => {
  try {
    const {
      name, email, password,
    } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email, password: hash,
    });
    res.send({
      _id: user._id,
      name: user.name,
      email: user.email,
      message: 'Пользователь создан.',
    });
  } catch (err) {
    if (err.code === 11000) {
      next(new ConflictError('Пользователь с таким email уже существует.'));
    } else {
      next(err);
    }
  }
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key',
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

module.exports.updateUser = (req, res, next) => {
  const { name, email } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, email }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        return next(new ErrorNotFoundCode('Пользователь с указанным _id не найден.'));
      }
      return res.send({ user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new ErrorCode('Переданы некорректные данные при обновлении профиля.'));
      } else {
        next(err);
      }
    });
};

module.exports.getMe = (req, res, next) => {
  User.findOne({ _id: req.user._id })
    .then((user) => {
      res.send(user);
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
  return res.send({ message: 'Bye!' });
};
