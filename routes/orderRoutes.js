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
	.route('/myorders')
	.get(authController.protect, orderController.getMyOrders);

router
	.route('/:id')
	.get(
		authController.protect,
		authController.permit('admin'),
		orderController.getOrder
	);

router
	.route('/:id/pay')
	.put(
		authController.protect,
		authController.permit('admin'),
		orderController.updateOrderToPaid
	);

router
	.route('/:id/deliver')
	.put(
		authController.protect,
		authController.permit('admin'),
		orderController.updateOrderStatus
	);

module.exports = router;
