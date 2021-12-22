const express = require('express');
const orderController = require('../controllers/orderController');

const authController = require('../controllers/authController');

const router = express.Router();

router
	.route('/')
	.get(
		authController.protect,
		authController.permit('admin'),
		orderController.getAllOrders
	)
	.post(
		authController.protect,
		authController.permit('user'),
		orderController.placeOrder
	);

router
	.route('/:id')
	.get(
		authController.protect,
		authController.permit('admin'),
		orderController.getOrder
	)
	.put(
		authController.protect,
		authController.permit('admin'),
		orderController.updateOrder
	);

module.exports = router;
