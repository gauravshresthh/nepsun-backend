const SubCategories = require('../models/subCategoriesModel');
const Product = require('../models/productModel');
const CustomError = require('../utils/CustomError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const fs = require('fs');
const path = require('path');

exports.createSubCategories = catchAsync(async (req, res, next) => {
	const schema = Joi.object({
		name: Joi.string().required(),
		image: Joi.string().required(),
		category_id: Joi.string().required(),
	});

	const { error } = schema.validate({
		name: req.body.name,
		image: req.body.image,
		category_id: req.body.category_id,
	});

	if (error) {
		return next(new CustomError(`${error.details[0].message}`, 403));
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
	let subCategory = await SubCategories.findById(req.params.id);
	if (!subCategory) {
		return next(new CustomError('No sub-category found with that id', 404));
	}
	let errorDeletingImage = false;
	if (req.body.image) {
		const imagePath = path.join(__dirname, '..', 'public', subCategory.image);
		fs.unlink(imagePath, async err => {
			if (err) {
				errorDeletingImage = true;
			}
			return;
		});
	}
	subCategory = await SubCategories.findByIdAndUpdate(req.params.id, req.body, {
		runValidators: false,
		new: true,
	});

	res
		.status(200)
		.json({ status: 'success', errorDeletingImage, data: subCategory });
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
