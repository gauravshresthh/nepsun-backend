const Orders = require('../models/orderModel');
const CustomError = require('../utils/CustomError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const fs = require('fs');

exports.placeOrder = catchAsync(async (req, res, next) => {
	req.body.user_id = req.user.id;
	newOrder = await Orders.create(req.body);
	res.status(201).json({ status: 'success', data: newOrder });
});

exports.getAllOrders = catchAsync(async (req, res, next) => {
	const { name } = req.query;

	const regex = new RegExp(name, 'i');

	const features = new APIFeatures(Orders.find(), req.query)
		.filter({ name: regex })
		.sort()
		.limitFields()
		.paginate()
		.populate({ path: 'user_id', select: 'name email' })
		.populate({ path: 'product_id', select: 'name' });
	const orders = await features.query;
	return res.status(200).json({
		status: 'success',
		currentDataCount: orders.length,
		data: orders,
	});
});

exports.getOrders = catchAsync(async (req, res, next) => {
	const Orders = await Orders.findById(req.params.id);

	if (!Orders) {
		return next(new CustomError('No Order found with that id', 404));
	}
	res.status(200).json({ status: 'success', data: Orders });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
	if (!req.params.id) {
		return next(new CustomError('Please provide a Order ID', 400));
		// Yes, it's a valid ObjectId, proceed with `findById` call.
	}
	if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
		return next(new CustomError('Invalid Order ID provided.', 400));
		// Yes, it's a valid ObjectId, proceed with `findById` call.
	}
	const order = await Orders.findById(req.params.id);
	if (order) {
		order.order_status = 'Delivered';
		order.delivered_at = Date.now();
		const updatedOrder = await order.save();
		return res.status(200).json({ status: 'success', data: updatedOrder });
	}
	return next(new CustomError('No Order found with that id', 404));
});

exports.updateOrderToPaid = catchAsync(async (req, res, next) => {
	if (!req.params.id) {
		return next(new CustomError('Please provide a Order ID', 400));
		// Yes, it's a valid ObjectId, proceed with `findById` call.
	}
	if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
		return next(new CustomError('Invalid Order ID provided.', 400));
		// Yes, it's a valid ObjectId, proceed with `findById` call.
	}
	const order = await Orders.findById(req.params.id);
	if (order) {
		order.is_paid = true;
		order.paid_at = Date.now();
		const updatedOrder = await order.save();
		return res.status(200).json({ status: 'success', data: updatedOrder });
	}
	return next(new CustomError('No Order found with that id', 404));
});

exports.getMyOrders = asyncHandler(async (req, res) => {
	const orders = await Order.find({ user: req.user._id });
	res.json(orders);
});
