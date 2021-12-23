const multer = require('multer');
const sharp = require('sharp');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const CustomError = require('./../utils/CustomError');
const APIFeatures = require('../utils/apiFeatures');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
	if (file.mimetype.startsWith('image')) {
		cb(null, true);
	} else {
		cb(new CustomError('Not an image! Please upload only images.', 400), false);
	}
};

const upload = multer({
	storage: multerStorage,
	fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
	if (!req.file) return next();
	req.file.filename = `${Date.now()}${Math.round(Math.random() * 1e4)}.jpeg`;
	req.body.photo = `uploads/${req.file.filename}`;
	await sharp(req.file.buffer)
		.toFormat('jpeg')
		.jpeg({ quality: 100 })
		.toFile(`public/uploads/${req.file.filename}`);
	next();
});

const filterObj = (obj, ...allowedFields) => {
	const newObj = {};
	Object.keys(obj).forEach(el => {
		if (allowedFields.includes(el)) newObj[el] = obj[el];
	});
	return newObj;
};

exports.getMe = (req, res, next) => {
	req.params.id = req.user.id;
	next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
	// 1) Create error if user POSTs password data
	if (req.body.password || req.body.role) {
		return next(
			new CustomError(
				'This route is not for password/role updates. Please use other routes.',
				400
			)
		);
	}

	// 2) Filtered out unwanted fields names that are not allowed to be updated
	const filteredBody = filterObj(req.body, 'name', 'photo', 'phone');

	// 3) Update user document
	const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		status: 'success',
		data: {
			user: updatedUser,
		},
	});
});

exports.deleteMe = catchAsync(async (req, res, next) => {
	await User.findByIdAndUpdate(req.user.id, { active: false });
	res.status(204).json({
		status: 'success',
		data: null,
	});
});

exports.createUser = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'This route is not defined! Please use /signup instead',
	});
};

// exports.getUser = factory.getOne(User);
// exports.getAllUsers = factory.getAll(User);
exports.getUser = catchAsync(async (req, res, next) => {
	if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
		return next(new CustomError('Invalid user ID provided.', 400));
		// Yes, it's a valid ObjectId, proceed with `findById` call.
	}
	const user = await User.findById(req.params.id);

	if (!user) {
		return next(new CustomError('No User found with that id', 404));
	}
	res.status(200).json({ status: 'success', data: user });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
	const { name } = req.query;
	const { email } = req.query;

	const regex = new RegExp(name, 'i');
	const emailRegex = new RegExp(email, 'i');
	// const users = await Hospital.find({ name: regex });
	const features = new APIFeatures(User.find(), req.query)
		.filter({ name: regex, email: emailRegex })
		.sort()
		.limitFields()
		.paginate();
	const users = await features.query;
	const usersCount = await User.countDocuments();

	return res.status(200).json({
		status: 'success',
		usersCount,
		data: users,
	});
});

// Do NOT update passwords with this!
// exports.updateUser = factory.updateOne(User);

exports.updateUser = catchAsync(async (req, res, next) => {
	if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
		return next(new CustomError('Invalid user ID provided.', 400));
		// Yes, it's a valid ObjectId, proceed with `findById` call.
	}
	const user = await User.findByIdAndUpdate(req.params.id, req.body, {
		runValidators: true,
		new: true,
	});

	if (!user) {
		return next(new CustomError('No user found with that id', 404));
	}
	res.status(200).json({ status: 'success', data: user });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
	if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
		return next(new CustomError('Invalid user ID provided.', 400));
		// Yes, it's a valid ObjectId, proceed with `findById` call.
	}
	await User.findByIdAndUpdate(req.params.id, { active: false });
	res.status(204).json({
		status: 'success',
		data: null,
	});
});
