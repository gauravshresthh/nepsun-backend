const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
	{
		order_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: [true, 'There must be a order to view order items.'],
			ref: 'order',
		},
		product_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: [true, 'There must be a product info for order.'],
			ref: 'product',
		},
		quantity: {
			type: Number,
			required: true,
			default: 0,
		},
		price: { type: Number, required: true },
	},
	{ timestamps: true }
);

const OrderItem = mongoose.model('order_item', orderItemSchema);

module.exports = Order;
