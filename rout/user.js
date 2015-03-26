var log = require('../util/log.js'),
	express = require('express'),
	APIError = require('../model/apierror.js'),
	User = {
		model: require('../model/user.js'),
		router: express.Router()
	},
	Auth = {
		model: require('../model/auth.js'),
		router: require('./auth.js')
	};


User.router.find = function(req, res, next) {
	var userId = req.params.userId;
	if (!userId) {
		return res.ng(APIError.invalidParameter(['userId']));
	}

	User.model.findOne({
		userId: userId,
		deleted: false
	}, function(err, user) {
		if (err) {
			log(err);
			return res.ng(APIError.unknown());
		}

		req.user = user || null;
		next();
	});
};

User.router.findMust = [User.router.find, function(req, res, next) {
	if (!req.user) return res.ng(APIError.notFound(['user']));

	next();
}];

User.router.isEditable = function(req, res, next) {
	req.isEditable = req.user && req.auth && req.auth.user[0].userId === req.user.userId;
	next();
};

User.router.isEditableMust = [
	User.router.isEditable,
	function(req, res, next) {
		if (!req.user) {
			return res.ng(APIError.notFound(['user']));
		}

		if (!req.isEditable) {
			return res.ng(APIError.permissionDenied());
		}

		next();
	}
]

User.router.get('/:userId',
	User.router.findMust,
	function(req, res, next) {
		return res.ok(User.model.toObject(req.user));
	});

User.router.post('/:userId',
	User.router.find,
	function(req, res, next) {
		if (req.user) {
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

				return res.ok(User.model.toObject(createdUser));
			});
	});

User.router.patch('/:userId',
	Auth.router.findMust,
	User.router.findMust,
	User.router.isEditableMust,
	function(req, res, next) {
		var name = req.body.name,
			updateValue = {
				updated: new Date()
			};

		if (name) updateValue.name = name;

		User.model.findByIdAndUpdate(req.user._id, updateValue, function(err, updatedUser) {
			if (err) {
				log(err);
				return res.ng(APIError.unknown());
			}

			return res.ok(User.model.toObject(updatedUser));
		});
	});

User.router.delete('/:userId',
	Auth.router.findMust,
	User.router.findMust,
	User.router.isEditableMust,
	function(req, res, next) {
		User.model.findByIdAndUpdate(req.auth.user[0]._id, {
			updated: new Date(),
			deleted: true
		}, function(err) {
			if (err) {
				log(err);
				return res.ng(APIError.unknown());
			}

			Auth.model.findByIdAndRemove(req.auth._id, function(err) {
				if (err) {
					log(err);
					return res.ng(APIError.unknown());
				}

				return res.ok();
			});
		});
	});

module.exports = User.router;
