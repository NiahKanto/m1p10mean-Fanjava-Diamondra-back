var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const Getconn = require('./db/ConnexionDB');
const user_router=require('./routes/user_route');

var clientsRouters = require('./routes/clients');
var serviceRouters = require('./routes/services');
var rdvRouters = require('./routes/rdvs');
var offreRouters = require('./routes/offres')

var cors = require('cors');

var app = express();

// app.use(cors());
app.use(cors({
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] // Ajoutez OPTIONS pour prendre en charge les pré-vérifications CORS
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/clients', clientsRouters);
app.use('/', user_router);
app.use('/service', serviceRouters);
app.use('/rdv', rdvRouters);
app.use('/offre', offreRouters);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

Getconn.getConn();

module.exports = app;
