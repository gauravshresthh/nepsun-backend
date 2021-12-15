const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'A product must have a name'],
		},
		model: String,
		images: {
			type: Array,
		},
		tags: { type: Array },
		sub_categories_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'sub_categories',
		},
		count_in_stock: {
			type: Number,
			default: 0,
		},
		video_url: String,
		colors: Array,
		sizes: Array,
		variant: Array,
		is_active: {
			type: Boolean,
			default: true,
		},
		price: {
			type: Number,
			required: true,
			default: 0,
		},
		discount: String,
		is_featured: { type: Boolean, default: false },
		brand: String,
		created_by: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'user',
		},
		highlights: String,
		description: String,
		seo_title: String,
		seo_description: String,
		slug: String,
	},
	{ timestamps: true }
);

const Product = mongoose.model('product', productSchema);

module.exports = Product;
