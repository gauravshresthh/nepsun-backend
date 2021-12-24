const Orders = require('../models/orderModel');
const CustomError = require('../utils/CustomError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const Joi = require('joi');
const { io } = require('../server');
const randomNumberGenerator = require('../utils/randomNumberGenerator');

exports.placeOrder = catchAsync(async (req, res, next) => {
	const schema = Joi.object({
		order_items: Joi.array().required(),
		shipping_address: Joi.object({
			address: Joi.string().required(),
			city: Joi.string().required(),
		}).required(),
	});

	const { error } = schema.validate({
		order_items: req.body.order_items,
		shipping_address: req.body.shipping_address,
	});

	if (error) {
		return next(new CustomError(`${error.details[0].message}`, 400));
	}
	const { order_items, shipping_address } = req.body;
	req.body.user_id = req.user.id;
	let total = 0;
	if (order_items.length === 0) {
		return next(new CustomError('No Order Items provided in the request', 400));
	}
	if (order_items) {
		order_items.map(
			product => (total = total + product.price * product.quantity)
		);
	}
	req.body.total = total;
	req.body.ref_id = randomNumberGenerator(1000000000000000, 9999999999999999);
	const order = new Orders({
		order_items,
		shipping_address,
		...req.body,
	});
	const newOrder = await order.save();
	io.emit('order-added', newOrder);
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
		.populate({ path: 'user_id', select: 'name email phone' })
		.populate({ path: 'order_items.product_id' });
	const orders = await features.query;
	const totalOrders = await Orders.countDocuments();
	return res.status(200).json({
		status: 'success',
		currentDataCount: orders.length,
		totalOrders,
		data: orders,
	});
});

exports.getOrder = catchAsync(async (req, res, next) => {
	const order = await Orders.findById(req.params.id)
		.populate({ path: 'user_id', select: 'name email' })
		.populate({ path: 'order_items.product_id' });

	if (!order) {
		return next(new CustomError('No Order found with that id', 404));
	}
	res.status(200).json({ status: 'success', data: order });
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
		order.order_status = req.body.order_status || 'Delivered';
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
		order.payment_status = req.body.payment_status || 'paid';
		order.paid_at = Date.now();
		const updatedOrder = await order.save();
		return res.status(200).json({ status: 'success', data: updatedOrder });
	}
	return next(new CustomError('No Order found with that id', 404));
});

exports.getMyOrders = catchAsync(async (req, res) => {
	const orders = await Orders.find({ user_id: req.user._id });

	return res.status(200).json({
		status: 'success',
		currentDataCount: orders.length,
		data: orders,
	});
});
