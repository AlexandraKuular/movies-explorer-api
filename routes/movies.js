const router = require('express').Router();
const {
  getMovies, createMovie, deleteMovie,
} = require('../controllers/movies');
const { validationMovie, validationMovieId } = require('../middlewares/validations');

router.get('/', getMovies);
router.post('/', validationMovie, createMovie);
router.delete('/:_id', validationMovieId, deleteMovie);

module.exports = router;
