var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var mongoose = require('mongoose');
const dotenv = require('dotenv').config();
var moment = require('moment');
var multer  = require('multer');
var helmet = require('helmet'); // protects the app from some well-known web vulnerabilities by setting appropriate HTTP headers
var async = require('async');
var mongoDB = process.env.database;
console.log(mongoDB);
mongoose.connect(mongoDB);
db = mongoose.connection;
//bind connecton to error event(to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//middleware for compression of server responses
var compression = require('compression');

var index = require('./routes/index');
var users = require('./routes/users');
var products = require('./routes/products');
var app = express();


app.use(compression()); //Compress all routes
app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressValidator());
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));

app.use('/', index);
app.use('/users', users);
app.use('/products', products);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
