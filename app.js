require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { sequelize } = require('./models');
const authRouter = require('./routes/auth');
const responseHelpers = require('./middleware/response');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();
const sessionStore = new SequelizeStore({ db: sequelize });
app.set('sessionStore', sessionStore);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(responseHelpers);
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-me',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }
}));
// Sass is precompiled via npm scripts (see package.json)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/auth', authRouter);
app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = createError(404);
  if (req.accepts('json')) {
    return res.error(err.message, err.status);
  }
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  const status = err.status || 500;
  if (req.accepts('json')) {
    return res.error(err.message || 'Server Error', status);
  }
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(status);
  res.render('error');
});

module.exports = app;
