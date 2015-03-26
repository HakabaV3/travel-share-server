var express = require('express'),
	path = require('path'),
	favicon = require('serve-favicon'),
	logger = require('morgan'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	APIError = require('./model/apierror.js');

var app = express();

// uncomment after placing your favicon in /public
// app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// main contents
app.use('/api/v1', require('./rout/v1.js'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	res.ng(404, new APIError.notFound())
});


// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.ng(500, new APIError.unknown(err.message));
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.ng(500, new APIError.unknown());
});


module.exports = app;
