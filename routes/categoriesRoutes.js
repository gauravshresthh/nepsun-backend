const express = require('express');
const categoriesController = require('../controllers/categoriesController');
const uploadPhotoHelper = require('../utils/uploadPhotoHelper');
const authController = require('../controllers/authController');

const router = express.Router();

router
	.route('/')
	.get(categoriesController.getAllCategories)
	.post(
		authController.protect,
		authController.restrictTo('admin'),
		uploadPhotoHelper.uploadPhoto,
		uploadPhotoHelper.resizePhoto,
		categoriesController.createCategories
	);

router
	.route('/:id')
	.get(categoriesController.getCategories)
	.put(
		authController.protect,
		authController.restrictTo('admin'),
		uploadPhotoHelper.uploadPhoto,
		uploadPhotoHelper.resizePhoto,
		categoriesController.updateCategories
	)
	.delete(
		authController.protect,
		authController.restrictTo('admin'),
		categoriesController.deleteCategories
	);

module.exports = router;
