const Token = require('../models/tokenModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.createToken = catchAsync(async (req, res, next) => {
  newToken = await Token.create(req.body);
  res.status(201).json({ status: 'success', data: newToken });
});

exports.getAllTokens = catchAsync(async (req, res, next) => {
  const tokens = await Token.find();
  return res.status(200).json({
    status: 'success',
    results: tokens.length,
    data: tokens,
  });
});

exports.getToken = catchAsync(async (req, res, next) => {
  const token = await Token.findById(req.params.id);

  if (!token) {
    return next(new AppError('No token found with that id', 404));
  }
  res.status(200).json({ status: 'success', data: token });
});

exports.updateToken = catchAsync(async (req, res, next) => {
  const token = await Token.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: false,
    new: true,
  });

  if (!token) {
    return next(new AppError('No token found with that id', 404));
  }
  res.status(200).json({ status: 'success', data: token });
});

exports.deleteToken = catchAsync(async (req, res, next) => {
  const token = await Token.findByIdAndDelete(req.params.id);

  if (!token) {
    return next(new AppError('No token found with that id', 404));
  }
  res.status(204).json({ status: 'success', data: {} });
});
