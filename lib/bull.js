const Queue = require('bull');

const { findUser, deleteUserById } = require('../services/user');

const redis_url = process.env.REDIS_URL;
const userSignupQueue = new Queue('User:deleteInactive', redis_url);

userSignupQueue.process(async (job) => {
	const userId = job.data.userId;
	const user = await findUser({ _id: userId, verified: false });

	if (user) {
		const res = await deleteUserById(userId);
		const isDeleted = res.deletedCount === 1;
		isDeleted &&
			console.log('Successfully deleted unverified user with an id:', userId);
	}
});


const addJobToQueue = async (jobDetails, options) => {
	return await userSignupQueue.add(jobDetails, options);
};

module.exports = {
	addJobToQueue,
};
