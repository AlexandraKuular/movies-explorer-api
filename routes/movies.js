const router = require('express').Router();
const {
  validationPostMovie,
  validationDeleteMovie,
} = require('../middlewares/validation');

const {
  getMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movies');

router.get('/', getMovies);
router.post('/', validationPostMovie, createMovie);
router.delete('/:_id', validationDeleteMovie, deleteMovie);

module.exports = router;
