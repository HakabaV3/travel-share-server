var log = require('../util/log.js'),
	express = require('express'),
	APIError = require('../model/apierror.js'),
	Travel = {
		model: require('../model/travel.js'),
		middleware: require('../middleware/travel.js')
	},
	Auth = {
		model: require('../model/auth.js'),
		middleware: require('../middleware/auth.js')
	},
	ObjectId = require('mongoose').Types.ObjectId,
	router = express.Router();

router.get('/:travelId',
	Auth.middleware.find,
	Travel.middleware.findMust,
	Travel.middleware.isEditable,
	Travel.middleware.render);

router.get('/',
	Auth.middleware.findMust,
	function(req, res, next) {
		Travel.model.find({
			members: [req.session.auth.userId],
			deleted: false
		}, function(err, travels) {
			if (err) {
				log(err);
				return res.ng(APIError.unknown());
			}

			Travel.model.toObjectAll(travels, function(err, travelObjs) {
				if (err) {
					log(err);
					return res.ng(APIError.unknown());
				}

				res.ok(travelObjs);
			});
		})
	});

router.post('/',
	Auth.middleware.findMust,
	function(req, res, next) {
		var errorDetail = [],
			name = req.body.name;

		if (!name) errorDetail.push('name');
		if (errorDetail.length !== 0) {
			return res.ng(APIError.invalidParameter(errorDetail));
		}

		new Travel.model({
				name: name,
				members: [req.session.auth.userId]
			})
			.save(function(err, createdTravel) {
				if (err) {
					log(err);
					return res.ng(APIError.unknown());
				}

				req.session.travel = createdTravel;
				next();
			});
	},
	Travel.middleware.render);

router.patch('/:travelId',
	Auth.middleware.findMust,
	Travel.middleware.findMust,
	Travel.middleware.isEditableMust,
	function(req, res, next) {
		var name = req.body.name,
			updateValue = {
				updated: new Date()
			};

		if (name) updateValue.name = name;

		Travel.model.findByIdAndUpdate(req.session.travel._id, updateValue, function(err, updatedTravel) {
			if (err) {
				log(err);
				return res.ng(APIError.unknown());
			}

			req.session.travel = updatedTravel;
			next();
		});
	},
	Travel.middleware.render);

module.exports = router;
