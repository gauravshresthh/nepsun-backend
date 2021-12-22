const nodemailer = require('nodemailer');

const sendEmail = async options => {
	// 1) Create a transporter
	const transporter = nodemailer.createTransport({
		// host: process.env.EMAIL_HOST,
		// port: process.env.EMAIL_PORT,
		service: 'gmail',
		auth: {
			user: process.env.GMAIL_USERNAME,
			pass: process.env.GMAIL_PASSWORD,
		},
	});

	// 2) Define the email options
	const mailOptions = {
		from: 'Hamro Service <noreply@hamroservice.com>',
		to: options.email,
		subject: options.subject,
		text: options.message,
		// html:
	};

	// 3) Actually send the email
	try {
		await transporter.sendMail(mailOptions);
		console.log('mail sent');
	} catch (error) {
		console.log(error);
	}
};

module.exports = sendEmail;
