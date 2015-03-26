var log = require('../util/log.js'),
	express = require('express'),
	APIError = require('../model/apierror.js'),
	Join = {
		model: require('../model/join.js'),
		router: express.Router()
	},
	Travel = {
		model: require('../model/travel.js'),
		router: require('./travel.js')
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

Join.router.find = function(req, res, next) {
	var userId = req.params.userId,
		travelId = req.params.travelId,
		travelIdObj,
		errorDetail = [];

	if (!travelId) errorDetail.push('travelId');
	if (!userId) errorDetail.push('userId');

	if (errorDetail.length !== 0) {
		return res.ng(400, APIError.invalidParameter(errorDetail));
	}

	try {
		travelIdObj = new ObjectId(travelId);
	} catch (err) {
		return res.ng(404, APIError.notFound(['travelId']));
	}

	Join.model.findOne({
		'user.userId': userId,
		'travel._id': travelId,
		deleted: false
	}, function(err, join) {
		if (err) {
			log(err);
			return res.ng(500, APIError.unknown());
		}

		req.join = join || null;
		if (join) {
			req.travel = join.travel[0];
			req.user = join.user[0];
		}
		next();
	});
};

Join.router.joinMust = [
	Join.router.find,
	function(req, res, next) {
		if (!req.join) return res.ng(404, APIError.notFound(['join']));

		next();
	}
];

Join.router.isEditable = function(req, res, next) {
	req.isEditable = req.join && req.auth && req.auth.user[0].userId === req.params.userId;
	next();
};

Join.router.isEditableMust = [
	Travel.router.isEditable,
	function(req, res, next) {

		if (!req.auth || req.auth.user[0].userId !== req.params.userId) {
			return res.ng(403, APIError.permissionDenied());
		}

		if (!req.join) {
			return res.ng(404, APIError.notFound(['join']));
		}

		if (!req.isEditable) {
			return res.ng(403, APIError.permissionDenied());
		}

		next();
	}
];

Travel.router.get('/:userId',
	Auth.router.findMust,
	Join.router.find,
	Travel.router.isEditableMust,
	function(req, res, next) {
		return res.ok(Join.model.toObject(req.join));
	});

Travel.router.get('/',
	Auth.router.findMust,
	Travel.router.findMust,
	Travel.router.isEditableMust,
	function(req, res, next) {
		return res.ok(req.travel.members.map(User.model.toObject));
	});

Travel.router.post('/:userId',
	Auth.router.findMust,
	Travel.router.findMust,
	User.router.findMust,
	Travel.router.isEditableMust,
	function(req, res, next) {

		new Join.model({
				name: name,
				members: [req.auth.user[0]]
			})
			.save(function(err, createdTravel) {
				if (err) {
					log(err);
					return res.ng(500, APIError.unknown());
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
				return res.ng(500, APIError.unknown());
			}

			return res.ok(Travel.model.toObject(updatedTravel));
		});
	});

module.exports = Travel.router;
