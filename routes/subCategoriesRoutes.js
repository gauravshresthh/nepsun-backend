const express = require('express');
const subCategoriesController = require('../controllers/subCategoriesController');
const uploadPhotoHelper = require('../utils/uploadPhotoHelper');
const authController = require('../controllers/authController');

const router = express.Router();

router
	.route('/')
	.get(subCategoriesController.getAllSubCategories)
	.post(
		authController.protect,
		authController.restrictTo('admin'),
		uploadPhotoHelper.uploadPhoto,
		uploadPhotoHelper.resizePhoto,
		subCategoriesController.createSubCategories
	);

router
	.route('/:id')
	.get(subCategoriesController.getSubCategories)
	.put(
		authController.protect,
		authController.restrictTo('admin'),
		uploadPhotoHelper.uploadPhoto,
		uploadPhotoHelper.resizePhoto,
		subCategoriesController.updateSubCategories
	)
	.delete(
		authController.protect,
		authController.restrictTo('admin'),
		subCategoriesController.deleteSubCategories
	);

module.exports = router;
