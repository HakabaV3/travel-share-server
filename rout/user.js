var log = require('../util/log.js'),
	express = require('express'),
	APIError = require('../model/apierror.js'),
	User = {
		model: require('../model/user.js'),
		middleware: require('../middleware/user.js')
	},
	Auth = {
		model: require('../model/auth.js'),
		middleware: require('../middleware/auth.js')
	},
	router = express.Router();

router.get('/:userId',
	User.middleware.findMust,
	User.middleware.render);

router.post('/:userId',
	User.middleware.find,
	function(req, res, next) {
		if (req.session.user) {
			return res.ng(APIError.alreadyCreated(['userId'])); //@TODO エラー番号
		}

		var errorDetail = [],
			userId = req.params.userId,
			name = req.body.name,
			password = req.body.password;

		if (!name) errorDetail.push('name');
		if (!password) errorDetail.push('password');
		if (errorDetail.length !== 0) {
			return res.ng(APIError.invalidParameter(errorDetail));
		}

		new User.model({
				userId: userId,
				password: password,
				name: name
			})
			.save(function(err, createdUser) {
				if (err) {
					log(err);
					return res.ng(APIError.unknown());
				}

				req.session.user = createdUser;

				next();
			});
	},
	User.middleware.render);

router.patch('/:userId',
	Auth.middleware.findMust,
	User.middleware.findMust,
	User.middleware.isEditableMust,
	function(req, res, next) {
		var name = req.body.name,
			updateValue = {
				updated: new Date()
			};

		if (name) updateValue.name = name;

		User.model.findByIdAndUpdate(req.session.user._id, updateValue, function(err, updatedUser) {
			if (err) {
				log(err);
				return res.ng(APIError.unknown());
			}

			req.session.user = updatedUser;
			next();
		});
	},
	User.middleware.render);

router.delete('/:userId',
	Auth.middleware.findMust,
	User.middleware.findMust,
	User.middleware.isEditableMust,
	function(req, res, next) {
		User.model.findOneAndUpdate({
			userId: req.session.auth.userId
		}, {
			updated: new Date(),
			deleted: true
		}, function(err) {
			if (err) {
				log(err);
				return res.ng(APIError.unknown());
			}

			Auth.model.findByIdAndRemove(req.session.auth._id, function(err) {
				if (err) {
					log(err);
					return res.ng(APIError.unknown());
				}

				return res.ok();
			});
		});
	});

module.exports = router;
