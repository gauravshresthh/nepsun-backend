const multer = require('multer');
const sharp = require('sharp');
const CustomError = require('../utils/CustomError');
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
	limits: { fileSize: 1 * 1000 * 1000 },
});

exports.uploadPhotos = upload.array('images', 4);

exports.resizePhotos = catchAsync(async (req, res, next) => {
	if (!req.files) return next();
	let images = [];
	req.files.map(async file => {
		file.filename = `${Date.now()}${Math.round(Math.random() * 1e3)}.jpeg`;
		images.push(`uploads/${file.filename}`);
		await sharp(file.buffer)
			.toFormat('jpeg')
			.jpeg({ quality: 100 })
			.toFile(`public/uploads/${file.filename}`);
	});
	req.body.images = [...images];
	next();
});

exports.uploadPhoto = upload.single('image');

exports.resizePhoto = catchAsync(async (req, res, next) => {
	if (!req.file) return next();
	req.file.filename = `${Date.now()}${Math.round(Math.random() * 1e4)}.jpeg`;
	req.body.image = `uploads/${req.file.filename}`;
	await sharp(req.file.buffer)
		.toFormat('jpeg')
		.jpeg({ quality: 100 })
		.toFile(`public/uploads/${req.file.filename}`);

	next();
});
