const Categories = require('../models/categoriesModel');
const SubCategories = require('../models/subCategoriesModel');
const CustomError = require('../utils/CustomError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const fs = require('fs');
const path = require('path');
const Joi = require('joi');
const { get } = require('http');

exports.createCategories = catchAsync(async (req, res, next) => {
	const schema = Joi.object({
		name: Joi.string().required(),
		image: Joi.string().required(),
	});

	const { error } = schema.validate({
		name: req.body.name,
		image: req.body.image,
	});

	if (error) {
		let errorDeletingImage = false;
		if (req.body.image) {
			const imagePath = path.join(__dirname, '..', 'public', req.body.image);
			fs.unlink(imagePath, async err => {
				if (err) {
					errorDeletingImage = true;
				}
				return;
			});
		}
		return next(new CustomError(`${error.details[0].message}`, 400));
	}
	const { name } = req.body;
	const categoriesExists = await Categories.findOne({ name });

	if (categoriesExists) {
		let errorDeletingImage = false;
		if (req.body.image) {
			const imagePath = path.join(__dirname, '..', 'public', req.body.image);
			fs.unlink(imagePath, async err => {
				if (err) {
					errorDeletingImage = true;
				}
				return;
			});
		}
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
		.paginate()
		.populate({ path: 'parent_category_id' });
	const categories = await features.query;

	let newCategories;
	newCategories = await Categories.find();

	
	const categoriesCount = await Categories.countDocuments();

	return res.status(200).json({
		status: 'success',
		total: categoriesCount,
		currentDataCount: categories.length,
		data: newCategories,
	});
});

exports.getCategories = catchAsync(async (req, res, next) => {
	const category = await Categories.findById(req.params.id);

	if (!category) {
		return next(new CustomError('No category found with that id', 404));
	}
	res.status(200).json({ status: 'success', data: category });
});

exports.updateCategories = catchAsync(async (req, res, next) => {
	if (!req.params.id) {
		return next(new CustomError('Please provide a category ID', 400));
		// Yes, it's a valid ObjectId, proceed with `findById` call.
	}
	if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
		return next(new CustomError('Invalid category ID provided.', 400));
		// Yes, it's a valid ObjectId, proceed with `findById` call.
	}
	let category = await Categories.findById(req.params.id);
	if (!category) {
		return next(new CustomError('No category found with that id', 404));
	}

	let errorDeletingImage = false;
	if (req.body.image) {
		const imagePath = path.join(__dirname, '..', 'public', category.image);
		fs.unlink(imagePath, async err => {
			if (err) {
				errorDeletingImage = true;
			}
			return;
		});
	}

	category = await Categories.findByIdAndUpdate(req.params.id, req.body, {
		runValidators: false,
		new: true,
	});

	res
		.status(200)
		.json({ status: 'success', errorDeletingImage, data: category });
});

exports.deleteCategories = catchAsync(async (req, res, next) => {
	if (!req.params.id) {
		return next(new CustomError('Please provide a category ID', 400));
		// Yes, it's a valid ObjectId, proceed with `findById` call.
	}
	if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
		return next(new CustomError('Invalid category ID provided.', 400));
		// Yes, it's a valid ObjectId, proceed with `findById` call.
	}

	const category = await Categories.findById(req.params.id);
	if (!category) {
		return next(new CustomError('No category found with that id', 404));
	}
	// Checking if the category has dependent Subcategories or not
	const categoryHasSubCategories = await SubCategories.find({
		category_id: req.params.id,
	});

	if (categoryHasSubCategories.length) {
		return next(
			new CustomError(
				'There are sub-categories that depend on this category',
				400
			)
		);
	}
	const imagePath = path.join(__dirname, '..', 'public', category.image);
	fs.unlink(imagePath, async err => {
		if (err) {
			await Categories.findByIdAndDelete(req.params.id);
			return next(new CustomError('Error deleting category image', 500));
		} else {
			await Categories.findByIdAndDelete(req.params.id);
			return res.status(200).json({ status: 'success', data: {} });
		}
	});
});
