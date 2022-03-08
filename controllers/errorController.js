const CustomError = require('./../utils/CustomError');

const handleCastErrorDB = err => {
	const message = `Invalid ${err.path}: ${err.value}.`;

	return new CustomError(message, 400);
};

const handleDuplicateFieldsDB = err => {
	const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

	const message = `Duplicate field value entered: ${value}. Please try using some other value!`;
	return new CustomError(message, 400);
};

const handleValidationErrorDB = err => {
	const errors = Object.values(err.errors).map(el => el.message);
	const message = `Invalid data inserted. ${errors.join(' ')}`;

	// const message = Object.values(err.errors).map((el) => el.message);

	return new CustomError(message, 400);
};

const handleJWTError = () =>
	new CustomError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
	new CustomError('Your token has expired! Please log in again.', 401);

const handleMulterError = () => {
	return new CustomError(
		'Please check file size and enter valid fields with field name as "images"',
		400
	);
};

const sendErrorDev = (err, res) => {
	res.status(err.statusCode).json({
		status: err.status,
		error: err,
		message: err.message,
		stack: err.stack,
	});
};

const sendErrorProd = (err, res) => {
	// Operational, trusted error: send message to client
	if (err.isOperational) {
		return res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
		});

		// Programming or other unknown error: don't leak error details
	} else {
		// 1) Log error
		console.error('ERROR', err);

		// 2) Send generic message
		res.status(500).json({
			status: 'error',
			message: 'Internal Server Error!',
		});
	}
};

module.exports = (err, req, res, next) => {
	// console.log(err.stack);

	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	if (process.env.NODE_ENV === 'development') {
		sendErrorDev(err, res);
	} else if (process.env.NODE_ENV === 'production') {
		let error = err;

		if (error.name === 'CastError') error = handleCastErrorDB(error);
		if (error.code === 11000) error = handleDuplicateFieldsDB(error);
		if (error.name === 'ValidationError')
			error = handleValidationErrorDB(error);

		if (error.name === 'JsonWebTokenError') error = handleJWTError();
		if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
		if (error.name === 'MulterError') error = handleMulterError();

		sendErrorProd(error, res);
	}
};
