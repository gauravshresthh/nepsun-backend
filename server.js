const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const app = require('./app');

process.on('uncaughtException', err => {
	console.log('UNCAUGHT EXCEPTION ! Shutting Down....');
	console.log(err.name, err.message);
	process.exit(1);
});

const DB = process.env.DATABASE_LOCAL;
// process.env.DATABASE;

mongoose
	.connect(DB, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log(`DB connected...`);
	})
	.catch(err => {
		console.log(err);
	});

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
	console.log(`Server running at PORT : ${port}/`);
});

process.on('unhandledRejection', err => {
	console.log(err.name, err.message);
	console.log('UNHANDLED REJECTION ! Shutting Down...');
	server.close(() => {
		process.exit(1);
	});
});
