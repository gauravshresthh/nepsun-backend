const SubCategories = require('../models/subCategoriesModel');
const Product = require('../models/productModel');
const CustomError = require('../utils/CustomError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const fs = require('fs');
const path = require('path');

exports.createSubCategories = catchAsync(async (req, res, next) => {
	const { name } = req.body;
	const subCategoriesExists = await SubCategories.findOne({ name });

	if (subCategoriesExists) {
		return res.status(400).json({
			status: 'fail',
			message: `Sub-category with that name ${name} already exists.`,
		});
	}

	newSubCategory = await SubCategories.create(req.body);
	res.status(201).json({ status: 'success', data: newSubCategory });
});

exports.getAllSubCategories = catchAsync(async (req, res, next) => {
	const { name } = req.query;

	const regex = new RegExp(name, 'i');

	const features = new APIFeatures(SubCategories.find(), req.query)
		.filter({ name: regex })
		.sort()
		.limitFields()
		.paginate()
		.populate({ path: 'category_id', select: 'name' });
	const subCategories = await features.query;
	const subCategoriesCount = await SubCategories.countDocuments();

	return res.status(200).json({
		status: 'success',
		total: subCategoriesCount,
		currentDataCount: subCategories.length,
		data: subCategories,
	});
});

exports.getSubCategories = catchAsync(async (req, res, next) => {
	const subCategory = await SubCategories.findById(req.params.id);

	if (!subCategory) {
		return next(new CustomError('No sub-category found with that id', 404));
	}
	res.status(200).json({ status: 'success', data: subCategory });
});

exports.updateSubCategories = catchAsync(async (req, res, next) => {
	if (!req.params.id) {
		return next(new CustomError('Please provide a sub-category ID', 400));
		// Yes, it's a valid ObjectId, proceed with `findById` call.
	}
	if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
		return next(new CustomError('Invalid sub-category ID provided.', 400));
		// Yes, it's a valid ObjectId, proceed with `findById` call.
	}
	const subCategory = await SubCategories.findByIdAndUpdate(
		req.params.id,
		req.body,
		{
			runValidators: false,
			new: true,
		}
	);

	if (!subCategory) {
		return next(new CustomError('No sub-category found with that id', 404));
	}
	res.status(200).json({ status: 'success', data: subCategory });
});

exports.deleteSubCategories = catchAsync(async (req, res, next) => {
	if (!req.params.id) {
		return next(new CustomError('Please provide a sub-category ID', 400));
		// Yes, it's a valid ObjectId, proceed with `findById` call.
	}
	if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
		return next(new CustomError('Invalid sub-category ID provided.', 400));
		// Yes, it's a valid ObjectId, proceed with `findById` call.
	}

	const subCategory = await SubCategories.findById(req.params.id);
	if (!subCategory) {
		return next(new CustomError('No sub-category found with that id', 404));
	}
	// Checking if the category has dependent products or not
	const subCategoryHasProducts = await Product.find({
		sub_categories_id: req.params.id,
	});
	if (subCategoryHasProducts.length) {
		return next(
			new CustomError(
				'There are products that depend on this sub-category',
				400
			)
		);
	}
	const imagePath = path.join(__dirname, '..', 'public', subCategory.image);
	fs.unlink(imagePath, async err => {
		if (err) {
			await SubCategories.findByIdAndDelete(req.params.id);
			return next(new CustomError('Error deleting sub-category image', 500));
		} else {
			await SubCategories.findByIdAndDelete(req.params.id);
			return res.status(200).json({ status: 'success', data: {} });
		}
	});
});
