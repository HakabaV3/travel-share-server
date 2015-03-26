var express = require('express'),
	router = express.Router();

express.response.ok = function(result) {
	return this.json({
		status: 'OK',
		result: result || {}
	});
};

express.response.ng = function(code, result) {
	if (typeof code === 'object') {
		result = code;
		code = 404;
	}

	return this.status(code).json({
		status: 'NG',
		result: result
	});
};

router.use(function(req, res, next) {
	res.set({
		'Content-Type': 'application/json',
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Headers': 'X-Token',
		'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE'
	});
	next();
});
router.use('/auth', require('./auth.js'));
router.use('/user', require('./user.js'));
router.use('/travel', require('./travel.js'));

module.exports = router;
