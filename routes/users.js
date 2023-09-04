const router = require('express').Router();
const {
  getMe, updateUser,
} = require('../controllers/users');
const { validationUserInfo } = require('../middlewares/validations');

router.get('/me', getMe);
router.patch('/me', validationUserInfo, updateUser);

module.exports = router;
