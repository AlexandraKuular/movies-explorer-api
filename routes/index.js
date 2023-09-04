const router = require('express').Router();
const { validationLogin, validationRegister } = require('../middlewares/validations');
const auth = require('../middlewares/auth');
const {
  addUser, login,
} = require('../controllers/users');
const ErrorNotFoundCode = require('../errors/errorNotFoundCode');

router.post('/signup', validationRegister, addUser);
router.post('/signin', validationLogin, login);

router.use(auth);
router.use('/users', require('./users'));
router.use('/movies', require('./movies'));

router.use((req, res, next) => {
  next(new ErrorNotFoundCode('Ресурс по адресу не найден.'));
});

module.exports = router;
