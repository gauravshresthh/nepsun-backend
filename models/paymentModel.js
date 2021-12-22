const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
	{
		order_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: [true, 'There must be a order ID for payment.'],
			ref: 'order',
		},
		amount: {
			type: Number,
			required: true,
			default: 0.0,
		},
		type: {
			type: String,
			required: true,
			default: 'COD',
		},
		status: {
			type: Boolean,
			required: true,
			default: false,
		},
	},
	{ timestamps: true }
);

const Payment = mongoose.model('payment', paymentSchema);

module.exports = Payment;
