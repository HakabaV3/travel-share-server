var log = require('../util/log.js'),
	APIError = require('../model/apierror.js'),
	Travel = {
		model: require('../model/travel.js'),
	},
	ObjectId = require('mongoose').Types.ObjectId,
	middleware = {};

middleware.render = function(req, res, next) {
	Travel.model.toObject(req.session.travel, function(err, travel) {
		if (err) {
			log(err);
			return res.ng(APIError.unknown());
		}

		if (!req.session.isTravelEditable) {
			travel.members = [];
			travel.places = [];
		}

		return res.ok(travel);
	});
};

middleware.find = function(req, res, next) {
	var travelId = req.params.travelId,
		travelIdObj;

	if (!travelId) {
		return res.ng(APIError.invalidParameter(['travelId']));
	}

	try {
		travelIdObj = new ObjectId(travelId);
	} catch (err) {
		return res.ng(APIError.notFound(['travelId']));
	}

	Travel.model.findOne({
		_id: travelIdObj,
		deleted: false
	}, function(err, travel) {
		if (err) {
			log(err);
			return res.ng(APIError.unknown());
		}

		req.session.travel = travel || null;
		next();
	});
};

middleware.findMust = [
	middleware.find,
	function(req, res, next) {
		if (!req.session.travel) return res.ng(APIError.notFound(['travel']));

		next();
	}
];

middleware.isEditable = function(req, res, next) {
	if (!req.session.auth || !req.session.travel) {
		req.session.isTravelEditable = false;
		return next();
	}

	var members = req.session.travel.members,
		userId = req.session.auth.userId,
		i, max;

	for (i = 0, max = members.length; i < max; i++) {
		if (members[i] === userId) {
			req.session.isTravelEditable = true;
			return next();
		}
	}

	req.session.isTravelEditable = false;
	next();
};

middleware.isEditableMust = [
	middleware.isEditable,
	function(req, res, next) {

		if (!req.session.travel) {
			return res.ng(APIError.notFound(['travel']));
		}

		if (!req.session.isTravelEditable) {
			return res.ng(APIError.permissionDenied());
		}

		next();
	}
];

module.exports = middleware;
