const mongoose = require('mongoose');

const categoriesSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'A category must have a name'],
		},
		image: {
			type: String,
			required: [true, 'A category must have an image'],
		},
		is_active: {
			type: Boolean,
			default: true,
		},
		description: String,
		seo_title: String,
		seo_description: String,
		slug: String,
	},
	{ timestamps: true }
);

const Categories = mongoose.model('categories', categoriesSchema);

module.exports = Categories;
