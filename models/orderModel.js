const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: [true, 'There must be a user to order.'],
			ref: 'user',
		},
		order_items: [
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
		],
		total: {
			type: Number,
			required: true,
			default: 0.0,
		},
		payment_type: {
			type: String,
			required: true,
			default: 'COD',
		},
		is_paid: {
			type: Boolean,
			required: true,
			default: false,
		},
		paid_at: { type: Date },
		order_status: {
			type: String,
			required: true,
			default: 'Received',
		},
		delivered_at: { type: Date },
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
