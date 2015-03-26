var log = require('../util/log.js'),
	express = require('express'),
	APIError = require('../model/apierror.js'),
	Travel = {
		model: require('../model/travel.js'),
		router: express.Router()
	},
	Auth = {
		model: require('../model/auth.js'),
		router: require('./auth.js')
	},
	User = {
		model: require('../model/user.js'),
		router: require('./user.js')
	},
	ObjectId = require('mongoose').Types.ObjectId;

Travel.router.find = function(req, res, next) {
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

		req.travel = travel || null;
		next();
	});
};

Travel.router.findMust = [
	Travel.router.find,
	function(req, res, next) {
		if (!req.travel) return res.ng(APIError.notFound(['travel']));

		next();
	}
];

Travel.router.isEditable = function(req, res, next) {
	if (!req.auth || !req.travel) {
		req.isEditable = false;
		return next();
	}

	var members = req.travel.members,
		userId = req.auth.user[0].userId,
		i, max;

	for (i = 0, max = members.length; i < max; i++) {
		if (members[i].userId === userId) {
			req.isEditable = true;
			return next();
		}
	}

	req.isEditable = false;
	next();
};

Travel.router.isEditableMust = [
	Travel.router.isEditable,
	function(req, res, next) {

		if (!req.travel) {
			return res.ng(APIError.notFound(['travel']));
		}

		if (!req.isEditable) {
			return res.ng(APIError.permissionDenied());
		}

		next();
	}
];

Travel.router.get('/:travelId',
	Auth.router.find,
	Travel.router.findMust,
	Travel.router.isEditable,
	function(req, res, next) {
		if (req.isEditable) {
			return res.ok(Travel.model.toObject(req.travel));
		} else {
			return res.ok(Travel.model.toPublicObject(req.travel));
		}
	});

Travel.router.post('/',
	Auth.router.findMust,
	function(req, res, next) {
		var errorDetail = [],
			name = req.body.name;

		if (!name) errorDetail.push('name');
		if (errorDetail.length !== 0) {
			return res.ng(APIError.invalidParameter(errorDetail));
		}

		new Travel.model({
				name: name,
				members: [req.auth.user[0]]
			})
			.save(function(err, createdTravel) {
				if (err) {
					log(err);
					return res.ng(APIError.unknown());
				}

				return res.ok(Travel.model.toObject(createdTravel));
			});
	});

Travel.router.patch('/:travelId',
	Auth.router.findMust,
	Travel.router.findMust,
	Travel.router.isEditableMust,
	function(req, res, next) {
		var name = req.body.name,
			updateValue = {
				updated: new Date()
			};

		if (name) updateValue.name = name;

		Travel.model.findByIdAndUpdate(req.travel._id, updateValue, function(err, updatedTravel) {
			if (err) {
				log(err);
				return res.ng(APIError.unknown());
			}

			return res.ok(Travel.model.toObject(updatedTravel));
		});
	});

module.exports = Travel.router;
