const sendEmail = require('./sendEmail');

const options = {
	email: 'gaurav.shrestha@treeleaf.ai',
	subject: 'this is a test',
	text: 'hey there',
};
sendEmail(options);
