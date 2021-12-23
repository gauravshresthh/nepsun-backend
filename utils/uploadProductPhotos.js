const multer = require('multer');
const sharp = require('sharp');
const CustomError = require('./CustomError');
const catchAsync = require('./catchAsync');
const multerStorage = multer.memoryStorage();
const Joi = require('joi');

function hasRequiredFields(fields, cb) {
	const schema = Joi.object({
		name: Joi.string().required(),
		price: Joi.string().required(),
		images: Joi.required(),
	});

	const { error } = schema.validate({
		name: fields.name,
		price: fields.price,
		images: fields.images,
	});
	if (error) {
		cb(new CustomError(`${error.details[0].message}`, 400), false);
	}
	cb(null, true);
	return;
	// 1. Implement this!
}

const multerFilter = (req, file, cb) => {
	cb(null, hasRequiredFields(req.body, cb));
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
