const Categories = require('../models/categoriesModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const fs = require('fs');

exports.createCategories = catchAsync(async (req, res, next) => {
	const { name } = req.body;
	const categoriesExists = await Categories.findOne({ name });

	if (categoriesExists) {
		return res.status(400).json({
			status: 'fail',
			message: `Category with that name ${name} already exists.`,
		});
	}

	newCategory = await Categories.create(req.body);
	res.status(201).json({ status: 'success', data: newCategory });
});

exports.getAllCategories = catchAsync(async (req, res, next) => {
	const { name } = req.query;

	const regex = new RegExp(name, 'i');

	const features = new APIFeatures(Categories.find(), req.query)
		.filter({ name: regex })
		.sort()
		.limitFields()
		.paginate();
	const categories = await features.query;
	const categoriesCount = await Categories.countDocuments();

	return res.status(200).json({
		status: 'success',
		categoriesCount,
		data: categories,
	});
});

exports.getCategories = catchAsync(async (req, res, next) => {
	const category = await Categories.findById(req.params.id);

	if (!category) {
		return next(new AppError('No category found with that id', 404));
	}
	res.status(200).json({ status: 'success', data: category });
});

exports.updateCategories = catchAsync(async (req, res, next) => {
	if (!req.params.id) {
		return next(new AppError('Please provide a category ID', 400));
		// Yes, it's a valid ObjectId, proceed with `findById` call.
	}
	if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
		return next(new AppError('Invalid category ID provided.', 400));
		// Yes, it's a valid ObjectId, proceed with `findById` call.
	}
	const category = await Categories.findByIdAndUpdate(req.params.id, req.body, {
		runValidators: false,
		new: true,
	});

	if (!category) {
		return next(new AppError('No category found with that id', 404));
	}
	res.status(200).json({ status: 'success', data: category });
});

exports.deleteCategories = catchAsync(async (req, res, next) => {
	if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
		return next(new AppError('Invalid category ID provided.', 400));
		// Yes, it's a valid ObjectId, proceed with `findById` call.
	}
	const category = await Categories.findById(req.params.id);
	if (!category) {
		return next(new AppError('No category found with that id', 404));
	}
	let errorDeletingImage = false;
	try {
		fs.unlinkSync(`public/${category.image}`);
		await Categories.findByIdAndDelete(req.params.id);
	} catch (e) {
		errorDeletingImage = true;
		await Categories.findByIdAndDelete(req.params.id);
	}

	res.status(200).json({ status: 'success', errorDeletingImage, data: {} });
});
