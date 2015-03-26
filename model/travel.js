var mongoose = require('./db.js'),
	schema = require('../schema/travel.js'),
	User = {
		model: require('./user.js')
	},
	Place = {
		model: require('./place.js')
	};

var model = mongoose.model('Travel', schema);

model.toObject = function(travel) {
	return {
		id: travel._id.toString(),
		created: travel.created,
		updated: travel.updated,
		name: travel.name,
		members: travel.members.map(User.model.toObject),
		places: travel.places.map(Place.model.toObject)
	};
};

model.toPublicObject = function(travel) {
	return {
		id: travel._id.toString(),
		created: travel.created,
		updated: travel.updated,
		name: travel.name,
		members: [],
		places: []
	};
};

module.exports = model;
