const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const CustomError = require('./../utils/CustomError');
const sendEmail = require('../utils/sendEmail');
const Joi = require('joi');
const randomNumberGenerator = require('../utils/randomNumberGenerator');

const signToken = id => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};

const createSendToken = (user, statusCode, req, res) => {
	const token = signToken(user._id);

	// res.cookie('jwt', token, {
	//   expires: new Date(
	//     Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
	//   ),
	//   httpOnly: true,
	//   secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
	// });

	// Remove password from output
	user.password = undefined;

	res.status(statusCode).json({
		status: 'success',
		token,
		// data: user,
	});
};

exports.signup = catchAsync(async (req, res, next) => {
	const schema = Joi.object({
		name: Joi.string().required(),
		email: Joi.string()
			.email({
				minDomainSegments: 2,
				tlds: { allow: ['com', 'net'] },
			})
			.required(),
		password: Joi.string()
			.pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
			.required(),
	});

	const { error } = schema.validate({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
	});

	if (error) {
		return next(new CustomError(`${error.details[0].message}`, 403));
	}
	const { email } = req.body;

	const userExists = await User.findOne({ email });

	if (userExists) {
		return res.status(409).json({
			status: 'fail',
			message: 'This email address is already associated with another account.',
		});
	}

	let user = new User(req.body);
	const activationCode = randomNumberGenerator();
	const message = `Your activation code is : \n ${activationCode}`;

	await sendEmail({
		email: user.email,
		subject: 'Your Hamro Service account activation code.',
		message,
	});
	user.otp = activationCode;
	user = await user.save();
	return res.json({
		status: 'success',
		message:
			'User created successfully. Please activate your account using the code sent at your email.',
	});
});

exports.login = catchAsync(async (req, res, next) => {
	const schema = Joi.object({
		password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
		email: Joi.string().email({
			minDomainSegments: 2,
			tlds: { allow: ['com', 'net'] },
		}),
	});

	const { error } = schema.validate({
		email: req.body.email,
		password: req.body.password,
	});

	if (error) {
		return next(new CustomError(`${error.details[0].message}`, 403));
	}

	const { email, password } = req.body;

	// 1) Check if email and password exist
	if (!email || !password) {
		return next(new CustomError('Please provide email and password!', 400));
	}
	// 2) Check if user exists && password is correct
	const user = await User.findOne({ email }).select('+password');

	if (!user || !(await user.correctPassword(password, user.password))) {
		return next(new CustomError('Invalid email or password', 401));
	}

	if (user.role === 'admin') {
		return next(new CustomError('Not for admin login', 401));
	}
	if (!user.verified) {
		return res.status(401).send({
			status: 'fail',
			message: 'Your Account has not been activated. Please activate first',
		});
	}

	// 3) If everything ok, send token to client

	createSendToken(user, 200, req, res);
});

exports.loginAdmin = catchAsync(async (req, res, next) => {
	const schema = Joi.object({
		password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
		email: Joi.string().email({
			minDomainSegments: 2,
			tlds: { allow: ['com', 'net'] },
		}),
	});

	const { error } = schema.validate({
		email: req.body.email,
		password: req.body.password,
	});

	if (error) {
		return next(new CustomError(`${error.details[0].message}`, 403));
	}

	const { email, password } = req.body;

	// 1) Check if email and password exist
	if (!email || !password) {
		return next(new CustomError('Please provide email and password!', 400));
	}
	// 2) Check if user exists && password is correct
	const user = await User.findOne({ email }).select('+password');

	if (!user || !(await user.correctPassword(password, user.password))) {
		return next(new CustomError('Incorrect email or password', 401));
	}

	if (user.role !== 'admin') {
		return next(
			new CustomError(
				`Bad request .You are not allowed to access this resource`,
				401
			)
		);
	}

	createSendToken(user, 200, req, res);
	// 3) If everything ok, send token to client
});

// exports.logout = (req, res) => {
//   res.cookie('jwt', 'loggedout', {
//     expires: new Date(Date.now() + 10 * 1000),
//     httpOnly: true,
//   });
//   res.status(200).json({ status: 'success' });
// };

exports.protect = catchAsync(async (req, res, next) => {
	// 1) Getting token and check of it's there
	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		token = req.headers.authorization.split(' ')[1];
	}
	// else if (req.cookies.jwt) {
	//   token = req.cookies.jwt;
	// }

	if (!token) {
		return next(
			new CustomError(
				'You are not logged in! Please log in to get access.',
				401
			)
		);
	}

	// 2) Verification token

	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

	// 3) Check if user still exists
	const currentUser = await User.findById(decoded.id);
	if (!currentUser) {
		return next(
			new CustomError(
				'The user belonging to this token does no longer exist.',
				401
			)
		);
	}

	// 4) Check if user changed password after the token was issued
	if (currentUser.changedPasswordAfter(decoded.iat)) {
		return next(
			new CustomError(
				'User recently changed password! Please log in again.',
				401
			)
		);
	}

	// GRANT ACCESS TO PROTECTED ROUTE

	req.user = currentUser;
	// res.locals.user = currentUser;
	next();
});

exports.permit = (...permittedRoles) => {
	return (req, res, next) => {
		// roles ['admin', 'lead-guide']. role='user'
		if (!permittedRoles.includes(req.user.role)) {
			return next(
				new CustomError(
					`You do not have permission to perform this action.`,
					403
				)
			);
		}
		next();
	};
};

exports.resendActivationCode = catchAsync(async (req, res, next) => {
	// 1) Get user based on POSTed email
	if (!req.body.email)
		return next(new CustomError('Please provide an email address.', 400));
	const user = await User.findOne({ email: req.body.email });
	if (user.verified) {
		return next(new CustomError('User is already activated.', 400));
	}

	if (!user) {
		return next(new CustomError('There is no user with email address.', 404));
	}

	// 2) Generate the random reset token
	const otp = randomNumberGenerator();
	user.otp = otp;
	await user.save({ validateBeforeSave: false });

	// 3) Send it to user's email
	try {
		// const resetURL = `${req.protocol}://${req.get(
		// 	'host'
		// )}/api/v1/users/resetPassword/${resetToken}`;

		const message = `Your activation code is : \n ${otp}`;

		await sendEmail({
			email: req.body.email,
			subject: 'New Activation code',
			message,
		});
		return res.status(200).json({
			status: 'success',
			message: 'Activation code sent to email!',
		});
	} catch (err) {
		user.otp = undefined;
		await user.save({ validateBeforeSave: false });
		return next(
			new CustomError('There was an error sending the email. Try again later!'),
			400
		);
	}
});

// Node js express  authentication and authorization middleware

exports.forgotPassword = catchAsync(async (req, res, next) => {
	// 1) Get user based on POSTed email
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		return next(new CustomError('There is no user with email address.', 404));
	}

	// 2) Generate the random reset token
	const resetToken = user.createPasswordResetToken();
	await user.save({ validateBeforeSave: false });

	// 3) Send it to user's email
	try {
		// const resetURL = `${req.protocol}://${req.get(
		// 	'host'
		// )}/api/v1/users/resetPassword/${resetToken}`;

		const message = `Your password reset token : \n ${resetToken}`;

		await sendEmail({
			email: user.email,
			subject: 'Your password reset token valid for 10 minutes.',
			message,
		});
		return res.status(200).json({
			status: 'success',
			message: 'Token sent to email!',
		});
	} catch (err) {
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;
		await user.save({ validateBeforeSave: false });

		return next(
			new CustomError('There was an error sending the email. Try again later!'),
			500
		);
	}
});

exports.verifyToken = catchAsync(async (req, res, next) => {
	// 1) Get user based on the token
	const token = req.body.token;
	const email = req.body.email;
	const user = await User.findOne({
		email,
		passwordResetToken: token,
		passwordResetExpires: { $gt: Date.now() },
	});

	// 2) If token has not expired, and there is user, set the new password
	if (user) {
		const data = { user_id: user._id, token };
		return res.status(200).json({
			status: 'success',
			message: 'Token verified succesfully!',
			data,
		});
	}
	return next(new CustomError('Token is invalid or has expired', 400));
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
	// 1) Get user based on the token
	const code = req.body.code;
	const email = req.body.email;
	if (!code || !email) {
		return next(
			new CustomError('Please provide activation code and email to verify', 400)
		);
	}
	const user = await User.findOne({
		email,
		otp: code,
	});
	// 2) If token has not expired, and there is user, set the new password
	if (user) {
		user.verified = true;
		user.otp = undefined;
		await user.save();
		return res.status(200).json({
			status: 'success',
			message: 'Account activated succesfully, You can now login!',
		});
	}
	return next(
		new CustomError('Activation code is invalid or has expired', 400)
	);
});

exports.resetPasswordWithToken = catchAsync(async (req, res, next) => {
	// 1) Get user based on the token
	const token = req.body.token;
	const user_id = req.body.user_id;
	const user = await User.findOne({
		_id: user_id,
		passwordResetToken: token,
		passwordResetExpires: { $gt: Date.now() },
	});

	// 2) If token has not expired, and there is user, set the new password
	if (user) {
		user.password = req.body.password;
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;
		user.passwordChangedAt = Date.now();
		await user.save();
		return res.status(200).json({
			status: 'success',
			message: 'Password changed succesfully!',
		});
	}
	return next(new CustomError('Token is invalid or has expired', 400));
});

exports.updatePassword = catchAsync(async (req, res, next) => {
	// 1) Get user from collection
	const user = await User.findById(req.user.id).select('+password');

	// 2) Check if POSTed current password is correct
	if (!(await user.correctPassword(req.body.current_password, user.password))) {
		return next(new CustomError('Your current password is wrong.', 401));
	}

	// 3) If so, update password
	user.password = req.body.password;
	// user.passwordConfirm = req.body.passwordConfirm;
	await user.save();
	// User.findByIdAndUpdate will NOT work as intended!

	// 4) Log user in, send JWT
	createSendToken(user, 200, req, res);
});

// It is GET method, you have to write like that
//    app.get('/confirmation/:email/:token',confirmEmail)
