var log = require('../util/log.js'),
	express = require('express'),
	APIError = require('../model/apierror.js'),
	User = {
		model: require('../model/user.js')
	},
	Auth = {
		model: require('../model/auth.js'),
		middleware: require('../middleware/auth.js')
	},
	router = express.Router(),
	crypto = require('crypto');

router.get('/',
	Auth.middleware.find,
	function(req, res, next) {
		if (!req.session.auth) return res.ng(APIError.notFound(['auth']));

		next();
	},
	Auth.middleware.render);

router.post('/:userId',
	function(req, res, next) {
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
					userId: userId,
					token: token
				})
				.save(function(err, createdAuth) {
					if (err) {
						log(err);
						return res.ng(APIError.unknown());
					}

					req.session.auth = createdAuth;
					next();
				});
		});
	},
	Auth.middleware.render);

router.delete('/', function(req, res, next) {
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

module.exports = router;
