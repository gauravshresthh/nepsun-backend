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
		parent_category_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'categories',
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

function autoPopulateParentCategoryIds(next) {
	this.populate('parent_category_id');
	next();
}

categoriesSchema.pre('findOne', autoPopulateParentCategoryIds).pre('find', autoPopulateParentCategoryIds);

const Categories = mongoose.model('categories', categoriesSchema);

module.exports = Categories;
