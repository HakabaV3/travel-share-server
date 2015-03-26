var log = require('../util/log.js'),
	express = require('express'),
	APIError = require('../model/apierror.js'),
	User = {
		model: require('../model/user.js')
	},
	Auth = {
		model: require('../model/auth.js'),
		router: express.Router()
	},
	crypto = require('crypto');

Auth.router.find = function(req, res, next) {
	var token = req.get('X-Token');
	if (!token) {
		req.auth = null;
		return next();
	}

	Auth.model.findOne({
		token: token
	}, function(err, auth) {
		if (err) {
			log(err);
			return res.ng(APIError.unknown());
		}

		req.auth = auth || null;
		next();
	});
};

Auth.router.findMust = [
	Auth.router.find,
	function(req, res, next) {
		if (!req.auth) return res.ng(APIError.mustAuthorized());

		next();
	}
];

Auth.router.get('/',
	Auth.router.find,
	function(req, res, next) {
		if (!req.auth) {
			return res.ng(APIError.notFound(['auth']));
		}

		return res.ok(Auth.model.toObject(req.auth));
	});

Auth.router.post('/:userId', function(req, res, next) {
	var userId = req.params.userId,
		password = req.body.password;

	if (!password) {
		return res.ng(APIError.invalidParameter(['userId', 'password']));
	}

	User.model.findOne({
		userId: userId,
		password: password,
		deleted: false
	}, function(err, user) {
		if (err) {
			log(err);
			return res.ng(APIError.unknown());
		}

		/**
		 *	@NOTE
		 *	'error.detail' object always contains each reason because of security.
		 */
		if (!user) return res.ng(APIError.invalidParameter(['userId', 'password']));

		var salt = 'kahun shouga tsurai',
			token = crypto.createHash('sha512').update(userId + salt + password).digest('hex');

		new Auth.model({
				user: user,
				token: token
			})
			.save(function(err, createdAuth) {
				if (err) {
					log(err);
					return res.ng(APIError.unknown());
				}

				return res.ok(Auth.model.toObject(createdAuth));
			});
	});
});

Auth.router.delete('/', function(req, res, next) {
	var token = req.get('X-Token');
	if (!token) return res.ok();

	Auth.model.findOneAndRemove({
		token: token
	}, function(err) {
		if (err) {
			log(err);
			return res.ng(APIError.unknown());
		}

		return res.ok();
	});
});

module.exports = Auth.router;
