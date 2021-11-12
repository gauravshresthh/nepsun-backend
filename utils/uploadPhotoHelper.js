const multer = require('multer');
const sharp = require('sharp');
const CustomError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
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

exports.uploadPhoto = upload.single('image');

exports.resizePhoto = catchAsync(async (req, res, next) => {
	if (!req.file) return next();
	req.file.filename = `${Date.now()}.jpeg`;

	await sharp(req.file.buffer)
		.resize(800)
		.toFormat('jpeg')
		.jpeg({ quality: 90 })
		.toFile(`public/uploads/${req.file.filename}`);

	req.body.image = `uploads/${req.file.filename}`;

	next();
});
