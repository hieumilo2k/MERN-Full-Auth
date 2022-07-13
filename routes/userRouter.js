const router = require('express').Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const authAdminMiddleware = require('../middleware/authAdminMiddleware');

router.post('/register', userController.register);

router.post('/activation', userController.activateEmail);

router.post('/login', userController.login);

router.post('/refreshToken', userController.getAccessToken);

router.post('/forgot', userController.forgotPassword);

router.post('/resetPassword', authMiddleware, userController.resetPassword);

router.get('/information', authMiddleware, userController.getUserInformation);

router.get(
  '/allInformation',
  authMiddleware,
  authAdminMiddleware,
  userController.getUsersAllInformation
);

router.get('/logout', userController.logout);

router.patch('/update', authMiddleware, userController.updateUser);

router.patch(
  '/updateRole/:id',
  authMiddleware,
  authAdminMiddleware,
  userController.updateUsersRole
);

router.delete(
  '/delete/:id',
  authMiddleware,
  authAdminMiddleware,
  userController.deleteUser
);

// Social Login
router.post('/googleLogin', userController.googleLogin);

module.exports = router;
