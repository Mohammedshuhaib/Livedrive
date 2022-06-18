const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require('express-handlebars');
require('dotenv').config()
const session = require('express-session');
const flash = require('req-flash');
const nocache = require('nocache');
const db = require('./database/connection');
const userRouter = require('./routes/user');
const vendorsRouter = require('./routes/vendor');
const adminRouter = require('./routes/admin');

const app = express();

app.use(session({
  secret: process.env.SESSION_KEY,
  cookie: { maxAge: 6000000 },
}));
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});
app.use(flash());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({
  extname: 'hbs', defaultLayout: 'layout', layoutsDir: `${__dirname}/views/layout/`, partialsDir: `${__dirname}/views/partials/`,
}));
app.use(nocache());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

db.connect((err) => {
  if (err) {
    console.log(`error${err}`);
  } else {
    console.log('database connected succesfully');
  }
});
// app.use(fileUpload());
app.use('/', userRouter);
app.use('/vendor', vendorsRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
