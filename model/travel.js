var mongoose = require('./db.js'),
	schema = require('../schema/travel.js');

var model = mongoose.model('Travel', schema);

model.toObject = function(travel, callback) {
	return callback(null, {
		id: travel._id.toString(),
		created: travel.created,
		updated: travel.updated,
		name: travel.name,
		members: travel.members,
		places: travel.places
	});
};

model.toPublicObject = function(travel, callback) {
	return model.toObject(travel, function(err, travel) {
		if (err) callback(err, null);

		travel.members = [];
		travel.places = [];

		callback(null, travel);
	});
};

module.exports = model;
