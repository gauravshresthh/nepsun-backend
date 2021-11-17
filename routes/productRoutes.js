const express = require('express');
const productController = require('../controllers/productController');
const uploadPhotoHelper = require('../utils/uploadPhotoHelper');
const authController = require('../controllers/authController');

const router = express.Router();

router
	.route('/')
	.get(productController.getAllProduct)
	.post(
		authController.protect,
		authController.restrictTo('user'),
		uploadPhotoHelper.uploadPhoto,
		uploadPhotoHelper.resizePhoto,
		productController.createProduct
	);

router
	.route('/:id')
	.get(productController.getProduct)
	.put(
		authController.protect,
		authController.restrictTo('admin'),
		uploadPhotoHelper.uploadPhoto,
		uploadPhotoHelper.resizePhoto,
		productController.updateProduct
	)
	.delete(
		authController.protect,
		authController.restrictTo('admin'),
		productController.deleteProduct
	);

module.exports = router;
