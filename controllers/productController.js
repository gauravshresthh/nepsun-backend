const Product = require('../models/productModel');
const CustomError = require('../utils/CustomError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const fs = require('fs');

exports.createProduct = catchAsync(async (req, res, next) => {
	req.body.created_by = req.user.id;
	newProduct = await Product.create(req.body);
	res.status(201).json({ status: 'success', data: newProduct });
});

exports.getAllProduct = catchAsync(async (req, res, next) => {
	const { name } = req.query;
	const regex = new RegExp(name, 'i');

	const features = new APIFeatures(Product.find(), req.query)
		.filter({ name: regex })
		.sort()
		.limitFields()
		.paginate();
	const product = await features.query;
	const productCount = await Product.countDocuments();

	return res.status(200).json({
		status: 'success',
		productCount,
		data: product,
	});
});

exports.getProduct = catchAsync(async (req, res, next) => {
	const product = await Product.findById(req.params.id);

	if (!product) {
		return next(new CustomError('No Product found with that id', 404));
	}
	res.status(200).json({ status: 'success', data: product });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
	if (!req.params.id) {
		return next(new CustomError('Please provide a Product ID', 400));
		// Yes, it's a valid ObjectId, proceed with `findById` call.
	}
	if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
		return next(new CustomError('Invalid Product ID provided.', 400));
		// Yes, it's a valid ObjectId, proceed with `findById` call.
	}
	const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
		runValidators: false,
		new: true,
	});

	if (!product) {
		return next(new CustomError('No Product found with that id', 404));
	}
	res.status(200).json({ status: 'success', data: product });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
	if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
		return next(new CustomError('Invalid Product ID provided.', 400));
		// Yes, it's a valid ObjectId, proceed with `findById` call.
	}
	const product = await Product.findById(req.params.id);
	if (!product) {
		return next(new CustomError('No Product found with that id', 404));
	}
	let errorDeletingImage = false;
	try {
		fs.unlinkSync(`public/${product.image}`);
		await Product.findByIdAndDelete(req.params.id);
	} catch (e) {
		errorDeletingImage = true;
		return res.status(500).json({
			status: 'error',
			errorDeletingImage,
			data: { message: 'Failed to delete image , please try again' },
		});
	}

	res.status(200).json({ status: 'success', errorDeletingImage, data: {} });
});
