var log = require('../util/log.js'),
	express = require('express'),
	APIError = require('../model/apierror.js'),
	Auth = {
		model: require('../model/auth.js'),
		router: express.Router()
	},
	User = {
		model: require('../model/user.js')
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
			return res.ng(500, APIError.unknown());
		}

		req.auth = auth || null;
		next();
	});
};

Auth.router.findMust = [Auth.router.find, function(req, res, next) {
	if (!req.auth) return res.ng(403, APIError.permissionDenied());

	next();
}];

Auth.router.get('/',
	Auth.router.find,
	function(req, res, next) {
		if (!req.auth) {
			return res.ng(404, APIError.notFound(['auth']));
		}

		return res.ok(Auth.model.toObject(req.auth));
	});

/**
 * @TODO
 *	すでにログインしている場合に過去のトークンを無効化する
 *	(マルチデバイスログインを前提とするならこれは不要？)
 */
Auth.router.post('/:userId',
	function(req, res, next) {
		/**
		 * User.router.findMustを展開したもの。
		 * UserがAuthに依存しており、循環参照を避けるため。
		 */
		var userId = req.params.userId;
		if (!userId) {
			return res.ng(400, APIError.invalidParameter(['userId']));
		}

		User.model.findOne({
			userId: userId,
			deleted: false
		}, function(err, user) {
			if (err) {
				log(err);
				return res.ng(500, APIError.unknown());
			}

			/**
			 *	@NOTE
			 *	'error.detail' object always contains each reason because of security.
			 */
			if (!user) return res.ng(400, APIError.invalidParameter(['userId', 'password']));

			req.user = user;
			next();
		});
	},
	function(req, res, next) {
		var password = req.body.password;

		if (!req.user || !password || req.user.password !== password) {
			/**
			 *	@NOTE
			 *	'error.detail' object always contains each reason because of security.
			 */
			return res.ng(400, APIError.invalidParameter(['userId', 'password']));
		}

		var salt = 'kahun shouga tsurai',
			hash = crypto.createHash('sha512').update(req.user.userId + salt + password).digest('hex');

		new Auth.model({
				user: req.user,
				token: hash
			})
			.save(function(err, createdAuth) {
				if (err) {
					log(err);
					return res.ng(500, APIError.unknown());
				}

				return res.ok(Auth.model.toObject(createdAuth));
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
			return res.ng(500, APIError.unknown());
		}

		return res.ok();
	});
});

module.exports = Auth.router;
