const SubCategories = require('../models/subCategoriesModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const fs = require('fs');

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
		.paginate();
	const subCategories = await features.query;
	const subCategoriesCount = await SubCategories.countDocuments();

	return res.status(200).json({
		status: 'success',
		subCategoriesCount,
		data: subCategories,
	});
});

exports.getSubCategories = catchAsync(async (req, res, next) => {
	const subCategory = await SubCategories.findById(req.params.id);

	if (!subCategory) {
		return next(new AppError('No sub-category found with that id', 404));
	}
	res.status(200).json({ status: 'success', data: subCategory });
});

exports.updateSubCategories = catchAsync(async (req, res, next) => {
	if (!req.params.id) {
		return next(new AppError('Please provide a sub-category ID', 400));
		// Yes, it's a valid ObjectId, proceed with `findById` call.
	}
	if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
		return next(new AppError('Invalid sub-category ID provided.', 400));
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
		return next(new AppError('No sub-category found with that id', 404));
	}
	res.status(200).json({ status: 'success', data: subCategory });
});

exports.deleteSubCategories = catchAsync(async (req, res, next) => {
	if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
		return next(new AppError('Invalid sub-category ID provided.', 400));
		// Yes, it's a valid ObjectId, proceed with `findById` call.
	}
	const subCategory = await SubCategories.findById(req.params.id);
	if (!subCategory) {
		return next(new AppError('No sub-category found with that id', 404));
	}
	let errorDeletingImage = false;
	try {
		fs.unlinkSync(`public/${subCategory.image}`);
		await SubCategories.findByIdAndDelete(req.params.id);
	} catch (e) {
		errorDeletingImage = true;
		await SubCategories.findByIdAndDelete(req.params.id);
	}

	res.status(200).json({ status: 'success', errorDeletingImage, data: {} });
});
