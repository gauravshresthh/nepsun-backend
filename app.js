const express = require('express');
const morgan = require('morgan');
const path = require('path');
const compression = require('compression');
const globalErrorHandler = require('./controllers/errorController');
const app = express();
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

if (process.env.NODE_ENV == 'development') {
	app.use(morgan('dev'));
}
console.log(path.join(__dirname, 'public'));

app.use(mongoSanitize());
app.use(helmet());
app.use(xss());

const limiter = rateLimit({
	windowMs: 10 * 60 * 1000,
	max: 500,
	message: `Too many requests from this IP , please try again in a hour`,
});

app.use('/api', limiter);

// app.use(hpp());
app.use(cors());
// app.use(fileupload());

const categoriesRouter = require('./routes/categoriesRoutes');
const subCategoriesRouter = require('./routes/subCategoriesRoutes');
const userRouter = require('./routes/userRoutes');
const homeRouter = require('./routes/homeRoutes');
const AppError = require('./utils/appError');

app.use('/', homeRouter);

app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/subcategories', subCategoriesRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
	next(new AppError(`Cant find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
