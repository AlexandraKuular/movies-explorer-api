const mongoose = require('mongoose');
const isUrl = require('validator/lib/isURL');

const movieSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
  },
  director: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    require: true,
    validate: {
      validator: (v) => isUrl(v),
      message: 'Проверьте URL адрес.',
    },
  },
  trailerLink: {
    type: String,
    require: true,
    validate: {
      validator: (v) => isUrl(v),
      message: 'Проверьте URL адрес.',
    },
  },
  thumbnail: {
    type: String,
    require: true,
    validate: {
      validator: (v) => isUrl(v),
      message: 'Проверьте URL адрес.',
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  movieId: {
    type: Number,
    required: true,
  },
  nameRU: {
    type: String,
    required: true,
  },
  nameEN: {
    type: String,
    required: true,
  },
}, { versionKey: false });

module.exports = mongoose.model('movie', movieSchema);
