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
const rolesRouter = require('./routes/roles');
const permissionsRouter = require('./routes/permissions');
const facebookRouter = require('./routes/facebook');
const facebookAutomationsRouter = require('./routes/facebookAutomations');
const facebookInstantReplyRouter = require('./routes/facebookInstantReply');
const facebookFAQRouter = require('./routes/facebookFAQ');
const facebookWebhookRouter = require('./routes/facebookWebhook');
const cors = require('cors');
const allowedOrigins = (process.env.CLIENT_ORIGINS || 'http://localhost:5173').split(',').map((o) => o.trim()).filter(Boolean);

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();
const sessionStore = new SequelizeStore({ db: sequelize });
app.set('sessionStore', sessionStore);
app.set('etag', false);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));
// Prevent caching of API responses
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    res.set('Cache-Control', 'no-store');
  }
  next();
});
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
app.use(['/uploads', '/api/uploads'], express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRouter);
app.use('/api/roles', rolesRouter);
app.use('/api/permissions', permissionsRouter);
app.use('/api/facebook', facebookRouter);
app.use('/api/facebook', facebookAutomationsRouter);
app.use('/api/facebook', facebookInstantReplyRouter);
app.use('/api/facebook', facebookFAQRouter);
app.use('/api/facebook', facebookWebhookRouter);
app.use('/api', indexRouter);
app.use('/api/users', usersRouter);

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
