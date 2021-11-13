const Reviews = require('../models/reviewsModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const fs = require('fs');

exports.createReviews = catchAsync(async (req, res, next) => {
	newReview = await Reviews.create(req.body);
	res.status(201).json({ status: 'success', data: newReview });
});

exports.getAllReviews = catchAsync(async (req, res, next) => {
	const { name } = req.query;

	const regex = new RegExp(name, 'i');

	const features = new APIFeatures(Reviews.find(), req.query)
		.filter({ name: regex })
		.sort()
		.limitFields()
		.paginate();
	const reviews = await features.query;
	const reviewsCount = await Reviews.countDocuments();

	return res.status(200).json({
		status: 'success',
		reviewsCount,
		data: reviews,
	});
});

exports.getReviews = catchAsync(async (req, res, next) => {
	const Review = await Reviews.findById(req.params.id);

	if (!Review) {
		return next(new AppError('No Review found with that id', 404));
	}
	res.status(200).json({ status: 'success', data: Review });
});

exports.updateReviews = catchAsync(async (req, res, next) => {
	if (!req.params.id) {
		return next(new AppError('Please provide a Review ID', 400));
		// Yes, it's a valid ObjectId, proceed with `findById` call.
	}
	if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
		return next(new AppError('Invalid Review ID provided.', 400));
		// Yes, it's a valid ObjectId, proceed with `findById` call.
	}
	const Review = await Reviews.findByIdAndUpdate(req.params.id, req.body, {
		runValidators: false,
		new: true,
	});

	if (!Review) {
		return next(new AppError('No Review found with that id', 404));
	}
	res.status(200).json({ status: 'success', data: Review });
});

exports.deleteReviews = catchAsync(async (req, res, next) => {
	if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
		return next(new AppError('Invalid Review ID provided.', 400));
		// Yes, it's a valid ObjectId, proceed with `findById` call.
	}
	const Review = await Reviews.findById(req.params.id);
	if (!Review) {
		return next(new AppError('No Review found with that id', 404));
	}

	await Reviews.findByIdAndDelete(req.params.id);

	res.status(200).json({ status: 'success', data: {} });
});
