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
				name: { type: String, required: true },
				quantity: { type: Number, required: true },
				price: { type: Number, required: true },
				product_id: {
					type: mongoose.Schema.Types.ObjectId,
					required: true,
					ref: 'product',
				},
			},
		],
		payment_method: {
			type: String,
			required: true,
		},
		payment_result: {
			id: { type: String },
			status: { type: String },
			update_time: { type: String },
			email_address: { type: String },
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
		total_price: {
			type: Number,
			required: true,
			default: 0.0,
		},
		is_paid: {
			type: Boolean,
			required: true,
			default: false,
		},
		paid_at: {
			type: Date,
		},
		delivery_status: {
			type: String,
			required: true,
			default: 'Received',
		},
		delivered_at: {
			type: Date,
		},
	},
	{ timestamps: true }
);

const Order = mongoose.model('order', orderSchema);

module.exports = Order;
