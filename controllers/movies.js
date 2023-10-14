const Movie = require('../models/movie');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');
const ValidationError = require('../errors/ValidationError');
const { errorMessages } = require('../utils/constants');

module.exports.getMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => res.send(movies))
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const {
    movieId,
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    nameRU,
    nameEN,
  } = req.body;
  const owner = req.user._id;
  Movie.create({
    movieId,
    country,
    director,
    duration,
    year,
    description,
    owner,
    image,
    trailerLink,
    thumbnail,
    nameRU,
    nameEN,
  })
    .then((movie) => res.send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError(errorMessages.createMovie));
      } else {
        next(err);
      }
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params._id)
    .then((movie) => {
      if (!movie) next(new NotFoundError(errorMessages.movieNotFound));
      if (req.user._id === movie.owner.toString()) {
        return movie.remove();
      }
      return next(new ForbiddenError(errorMessages.removeMovie));
    })
    .then((movie) => res.send(movie))
    .catch(next);
};
