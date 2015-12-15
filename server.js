process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var fs = require('fs');
var join = require('path').join;
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var responseTime = require('response-time');
var mongoose = require('mongoose');
var app = express();
var listenPort = process.env.PORT || 3030;
var router = express.Router();

app.use(express.static(__dirname + '/docs'));
app.use(morgan('dev'));  // log every request to the console
app.use(responseTime());
app.use(bodyParser.json());

// Connect to mongodb
var connect = function () {
  var options = { server: { socketOptions: { keepAlive: 1 } } };
  mongoose.connect(config.db, options);
};
connect();

mongoose.connection.on('error', console.log);
mongoose.connection.on('disconnected', connect);

// Bootstrap models
fs.readdirSync(join(__dirname, 'app/models')).forEach(function (file) {
  if (file.indexOf('.js')) {
    //console.log(file);
    require(join(__dirname, 'js/models', file));
  }
});

// middleware specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});

// define the home page route
router.get('/', function(req, res) {
  res.send('home page');
});

// define the about route
router.get('/about', function(req, res) {
  res.send('About birds');
});

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var server = app.listen(listenPort, function () {
  console.log('Listening on port %d', server.address().port)
});
