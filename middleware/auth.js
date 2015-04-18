var log = require('../util/log.js'),
	APIError = require('../model/apierror.js'),
	Auth = {
		model: require('../model/auth.js'),
	},
	middleware = {};

middleware.render = function(req, res, next) {
	Auth.model.toObject(req.session.auth, function(err, auth) {
		if (err) {
			log(err);
			return res.ng(APIError.unknown());
		}

		return res.ok(auth);
	});
};

middleware.find = function(req, res, next) {
	var token = req.get('X-Token');
	if (!token) {
		req.session.auth = null;
		return next();
	}

	Auth.model.findOne({
		token: token
	}, function(err, auth) {
		if (err) {
			log(err);
			return res.ng(APIError.unknown());
		}

		req.session.auth = auth || null;
		next();
	});
};

middleware.findMust = [
	middleware.find,
	function(req, res, next) {
		if (!req.session.auth) return res.ng(APIError.mustAuthorized());

		next();
	}
];

module.exports = middleware;
