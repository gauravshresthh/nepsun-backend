const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/loginAdmin', authController.loginAdmin);

router.post('/forgotPassword', authController.forgotPassword);
router.put('/resetPassword/:token', authController.resetPassword);

// router.get('/confirmation/:phone/:token', authController.verifyNumber);

router.put(
	'/updateMyPassword',
	authController.protect,
	authController.updatePassword
);
router.get(
	'/me',
	authController.protect,
	userController.getMe,
	userController.getUser
);
router.put(
	'/updateMe',
	authController.protect,
	userController.uploadUserPhoto,
	userController.resizeUserPhoto,
	userController.updateMe
);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

router
	.route('/admin')
	.get(
		authController.protect,
		authController.permit('admin'),
		userController.getAllUsers
	)
	.post(
		authController.protect,
		authController.permit('admin'),
		userController.createUser
	);

router
	.route('/admin/:id')
	.get(
		authController.protect,
		authController.permit('admin'),
		userController.getUser
	)
	.put(
		authController.protect,
		authController.permit('admin'),
		userController.uploadUserPhoto,
		userController.resizeUserPhoto,
		userController.updateUser
	)
	.delete(
		authController.protect,
		authController.permit('admin'),
		userController.deleteUser
	);

module.exports = router;
