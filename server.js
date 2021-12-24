const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');
const compression = require('compression');
const http = require('http');
const socketIO = require('socket.io');
const globalErrorHandler = require('./controllers/errorController');
const app = express();

let server = http.createServer(app);
const io = socketIO(server, {
	transports: ["polling"],
	cors: {
		cors: {
			origin: 'http://localhost:3000',
		},
	},
});

io.on('connection', socket => {
	console.log('A user is connected');

	socket.on('message', message => {
		console.log(`message from ${socket.id} : ${message}`);
	});

	socket.on('disconnect', () => {
		console.log(`socket ${socket.id} disconnected`);
	});
});

exports.io = io;
const bodyParser = require('body-parser');
// const fileupload = require('express-fileupload');

const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.resolve(__dirname, 'client/build')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

if (process.env.NODE_ENV == 'development') {
	app.use(morgan('dev'));
}
console.log(path.join(__dirname, 'public'));

app.use(mongoSanitize());
app.use(helmet());
app.use(xss());

// const limiter = rateLimit({
// 	windowMs: 10 * 60 * 1000,
// 	max: 500,
// 	message: `Too many requests from this IP , please try again in a hour`,
// });

// app.use('/api', limiter);

// app.use(hpp());
app.use(cors());
// app.use(fileupload());
const orderRouter = require('./routes/orderRoutes');
const productRouter = require('./routes/productRoutes');
const categoriesRouter = require('./routes/categoriesRoutes');
const subCategoriesRouter = require('./routes/subCategoriesRoutes');
const reviewsRouter = require('./routes/reviewsRoutes');
const userRouter = require('./routes/userRoutes');
const homeRouter = require('./routes/homeRoutes');
const CustomError = require('./utils/CustomError');

app.use('/', homeRouter);

app.use('/api/v1/products', productRouter);
app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/subcategories', subCategoriesRouter);
app.use('/api/v1/reviews', reviewsRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
	next(new CustomError(`Cant find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

// server configuration

process.on('uncaughtException', err => {
	console.log('UNCAUGHT EXCEPTION ! Shutting Down....');
	console.log(err.name, err.message);
	process.exit(1);
});
const DB = process.env.DATABASE;
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

server = server.listen(port, () => {
	console.log(`Server running at PORT : ${port}/`);
});

process.on('unhandledRejection', err => {
	console.log(err.name, err.message);
	console.log('UNHANDLED REJECTION ! Shutting Down...');
	server.close(() => {
		process.exit(1);
	});
});
