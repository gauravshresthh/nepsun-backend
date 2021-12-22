const nodemailer = require('nodemailer');

const sendEmail = async options => {
	// 1) Create a transporter
	const transporter = nodemailer.createTransport({
		// host: process.env.EMAIL_HOST,
		// port: process.env.EMAIL_PORT,
		service: 'gmail',
		auth: {
			user: 'gauravshresthh@gmail.com',
			pass: 'pikachhu@9816947062',
		},
	});

	// 2) Define the email options
	const mailOptions = {
		from: 'Hamro Service <noreply@hamroservice.com>',
		to: 'gaurav.shrestha@treeleaf.ai',
		subject: options.subject,
		text: options.message,
		// html:
	};

	// 3) Actually send the email
	try {
		await transporter.sendMail(mailOptions);
		console.log("mail sent")
	} catch (error) {
		console.log(error);
	}
};
const options = { subject: 'this is a test', text: 'hey there' };
sendEmail(options);
module.exports = sendEmail;
