const User = require('./../models/userModel');

exports.findUser = async (query) => {
	return await User.findOne(query);
};

exports.deleteUserById = async (userId) => {
	return await User.deleteOne({ _id: userId });
};
