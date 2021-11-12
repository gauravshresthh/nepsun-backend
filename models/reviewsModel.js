const mongoose = require('mongoose');

const reviewsSchema = mongoose.Schema(
	{
		name: { type: String, required: true },
		rating: { type: Number, required: true },
		comment: { type: String, required: true },
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'user',
		},
		product_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'product',
		},
	},
	{
		timestamps: true,
	}
);

const Reviews = mongoose.model('reviews', reviewsSchema);

module.exports = Reviews;
