const express = require('express');
const morgan = require('morgan');
const tourRoute = require('./routes/tourRoutes');
const userRoute = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const reviewRoute = require('./routes/reviewRoutes');
const path = require('path')
const viewRouter = require('./routes/viewRoutes')
const cookieParser = require('cookie-parser')


const app = express();

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))
// SERVING STATIC FILES
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// MIDDLE WARES
console.log(process.env.NODE_ENV);
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'data:', 'blob:', 'unsafe-inline'],
 
      fontSrc: ["'self'", 'https:', 'data:'],

      scriptSrc: ["'self'", 'unsafe-inline'],
 
      scriptSrc: ["'self'", 'https://cloudflare.com/'],
 
      scriptSrcElem: ["'self'",'https:', 'https://cloudflare.com/'],
 
      styleSrc: ["'self'", 'https:', 'unsafe-inline', 'ws://localhost:*', 'unsafe-hashes'],
      
      connectSrc: ["'self'", 'data', 'https://cloudflare.com/', 'ws://localhost:*']
    },
  })
);
// app.use(helmet());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour',
});

app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({extended:true, limit: '10kb'}))
app.use(cookieParser())

app.use(mongoSanitize());
app.use(xss());
app.use(hpp());


app.use((req, res, next) => {
  // console.log('hello from the middleware');
  req.requestTime = new Date().toISOString();
  console.log(req.headers);
  next();
});

// ROUTES MIDDLEWARES
app.use('/', viewRouter)
app.use('/api/v1/tours', tourRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/reviews', reviewRoute);

// HANDLING ERROR IN EXPRESS
app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on the server`);
  // err.status = 'fail';
  // err.statusCode = 404;
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
