const Reviews = require('../models/reviewsModel');
const CustomError = require('../utils/CustomError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.createReviews = catchAsync(async (req, res, next) => {
	req.body.user_id = req.user.id;
	if (!req.body.product_id) {
		return next(new CustomError('Please provide a Product ID', 400));
		// Yes, it's a valid ObjectId, proceed with `findById` call.
	}
	if (!req.body.product_id.match(/^[0-9a-fA-F]{24}$/)) {
		return next(new CustomError('Invalid Product ID provided.', 400));
		// Yes, it's a valid ObjectId, proceed with `findById` call.
	}

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
		.paginate()
		.populate({ path: 'user_id', select: 'name email' })
		.populate({ path: 'product_id', select: 'name' });
	const reviews = await features.query;
	const reviewsCount = await Reviews.countDocuments();

	return res.status(200).json({
		status: 'success',
		total: reviewsCount,
		currentDataCount: reviews.length,
		data: reviews,
	});
});

exports.getReviews = catchAsync(async (req, res, next) => {
	const Review = await Reviews.findById(req.params.id);

	if (!Review) {
		return next(new CustomError('No Review found with that id', 404));
	}
	res.status(200).json({ status: 'success', data: Review });
});

exports.updateReviews = catchAsync(async (req, res, next) => {
	if (!req.params.id) {
		return next(new CustomError('Please provide a Review ID', 400));
		// Yes, it's a valid ObjectId, proceed with `findById` call.
	}
	if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
		return next(new CustomError('Invalid Review ID provided.', 400));
		// Yes, it's a valid ObjectId, proceed with `findById` call.
	}
	const review = await Reviews.findById(req.params.id);
	if (!review) {
		return next(new CustomError('No Review found with that id', 404));
	}
	if (review.user_id.toString() === req.user.id.toString()) {
		const Review = await Reviews.findByIdAndUpdate(req.params.id, req.body, {
			runValidators: false,
			new: true,
		});

		return res.status(200).json({ status: 'success', data: Review });
	}
	return next(
		new CustomError('You are not allowed to perform this action', 403)
	);
});

exports.deleteReviews = catchAsync(async (req, res, next) => {
	if (!req.params.id) {
		return next(new CustomError('Please provide a Review ID', 400));
		// Yes, it's a valid ObjectId, proceed with `findById` call.
	}
	if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
		return next(new CustomError('Invalid Review ID provided.', 400));
		// Yes, it's a valid ObjectId, proceed with `findById` call.
	}
	const review = await Reviews.findById(req.params.id);
	if (!review) {
		return next(new CustomError('No Review found with that id', 404));
	}
	if (review.user_id.toString() === req.user.id.toString()) {
		await Reviews.findByIdAndDelete(req.params.id);

		return res.status(200).json({ status: 'success', data: {} });
	}
	return next(
		new CustomError('You are not allowed to perform this action', 403)
	);
});
