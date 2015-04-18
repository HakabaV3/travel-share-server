var log = require('../util/log.js'),
	APIError = require('../model/apierror.js'),
	User = {
		model: require('../model/user.js')
	},
	middleware = {};

middleware.render = function(req, res, next) {
	User.model.toObject(req.session.user, function(err, user) {
		if (err) {
			log(err);
			return res.ng(APIError.unknown());
		}

		return res.ok(user);
	});
};

middleware.find = function(req, res, next) {
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

		req.session.user = user || null;
		next();
	});
};

middleware.findMust = [
	middleware.find,
	function(req, res, next) {
		if (!req.session.user) return res.ng(APIError.notFound(['user']));

		next();
	}
];

middleware.isEditable = function(req, res, next) {
	req.session.isUserEditable =
		req.session.user &&
		req.session.auth &&
		req.session.auth.userId === req.session.user.userId;
	next();
};

middleware.isEditableMust = [
	middleware.isEditable,
	function(req, res, next) {
		if (!req.session.user) {
			return res.ng(APIError.notFound(['user']));
		}

		if (!req.session.isUserEditable) {
			return res.ng(APIError.permissionDenied());
		}

		next();
	}
];

module.exports = middleware;
