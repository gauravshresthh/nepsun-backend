const mongoose = require('mongoose');

const subCategoriesSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'A category must have a name'],
		},
		category_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: [true, 'A category must have a category id'],
			ref: 'categories',
		},
		image: {
			type: String,
			required: [true, 'A sub-category must have an image'],
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

const subCategories = mongoose.model('sub_categories', subCategoriesSchema);

module.exports = subCategories;
