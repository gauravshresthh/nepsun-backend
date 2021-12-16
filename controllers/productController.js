const Product = require('../models/productModel');
const CustomError = require('../utils/CustomError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const fs = require('fs');
const path = require('path');

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
		.paginate()
		.populate({ path: 'sub_categories_id', select: 'name' })
		.populate({ path: 'created_by', select: 'name email' });
	const product = await features.query;
	const productCount = await Product.countDocuments();

	return res.status(200).json({
		status: 'success',
		total: productCount,
		currentDataCount: product.length,
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
	let imagePath;
	let errorDeletingImage = false;
	product.images &&
		product.images.map(image => {
			imagePath = path.join(__dirname, '..', 'public', image);
			fs.unlink(imagePath, err => {
				if (err) {
					return (errorDeletingImage = true);
				}
				return;
			});
		});
	if (!errorDeletingImage) {
		await Product.findByIdAndDelete(req.params.id);
		return res
			.status(200)
			.json({ status: 'success', errorDeletingImage, data: {} });
	}
	await Product.findByIdAndDelete(req.params.id);
	return next(new CustomError('Error deleting product images', 500));
});

exports.getLatestProducts = catchAsync(async (req, res, next) => {
	const products = await Product.find().sort({ createdAt: 1 }).limit(100);
	return res.status(200).json({
		status: 'success',
		currentDataCount: products.length,
		data: products,
	});
});
