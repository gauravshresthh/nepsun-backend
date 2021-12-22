const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: [true, 'There must be a user to order.'],
			ref: 'user',
		},
		total: {
			type: Number,
			required: true,
			default: 0.0,
		},
		payment_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: [true, 'There must be a payment info for order.'],
			ref: 'payment',
		},
		order_status: {
			type: String,
			required: true,
			default: 'Received',
		},
		shipping_address: {
			address: { type: String, required: true },
			city: { type: String, required: true },
		},
		shipping_price: {
			type: Number,
			required: true,
			default: 0.0,
		},
	},
	{ timestamps: true }
);

const Order = mongoose.model('order', orderSchema);

module.exports = Order;
