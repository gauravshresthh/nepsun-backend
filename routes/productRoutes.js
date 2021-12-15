const express = require('express');
const productController = require('../controllers/productController');
const uploadPhotoHelper = require('../utils/uploadPhotoHelper');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/get-latest').get(productController.getLatestProducts);
router
	.route('/')
	.get(productController.getAllProduct)
	.post(
		authController.protect,
		authController.permit('admin'),
		uploadPhotoHelper.uploadPhotos,
		uploadPhotoHelper.resizePhotos,
		productController.createProduct
	);

router
	.route('/:id')
	.get(productController.getProduct)
	.put(
		authController.protect,
		authController.permit('admin'),
		uploadPhotoHelper.uploadPhoto,
		uploadPhotoHelper.resizePhoto,
		productController.updateProduct
	)
	.delete(
		authController.protect,
		authController.permit('admin'),
		productController.deleteProduct
	);

module.exports = router;
