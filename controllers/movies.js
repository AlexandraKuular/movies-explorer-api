const Movie = require('../models/movie');
const ErrorCode = require('../errors/errorCode');
const ErrorNotFoundCode = require('../errors/errorNotFoundCode');
const ForbiddenError = require('../errors/forbiddenError');

module.exports.getMovies = (req, res, next) => {
  Movie.find({}).sort({ createdAt: -1 })
    .then((movies) => res.send(movies))
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  Movie.create(req.body)
    .then((movie) => {
      res.send({ movie });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ErrorCode('Переданы некорректные данные при добавлении фильма.'));
      } else {
        next(err);
      }
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .then((movie) => {
      if (!movie) {
        throw new ErrorNotFoundCode('Передан несуществующий _id фильма.');
      }
      if (movie.owner.toString() === req.user._id) {
        Movie.findByIdAndRemove(req.params.movieId)
          .then(() => res.status(200).send({ result: true }).catch(next));
      } else {
        throw new ForbiddenError('Удалить чужой фильм нельзя.');
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new ErrorCode('Переданы невалидные данные.'));
      } else {
        next(err);
      }
    });
};
