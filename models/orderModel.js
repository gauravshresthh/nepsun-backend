const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema(
	{
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
	{
		timestamps: true,
	}
);

const orderSchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: [true, 'There must be a user to order.'],
			ref: 'user',
		},
		order_items: [orderItemSchema],
		total: {
			type: Number,
			required: true,
			default: 0.0,
		},
		ref_id: { type: String },
		payment_type: {
			type: String,
			required: true,
			default: 'COD',
		},
		payment_status: {
			type: String,
			required: true,
			default: 'pending',
		},
		paid_at: { type: Date },
		order_status: {
			type: String,
			required: true,
			default: 'Received',
		},
		delivered_at: { type: Date },
		shipping_address: {
			address: { type: String },
			city: { type: String },
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
