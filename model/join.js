var mongoose = require('./db.js'),
	schema = require('../schema/join.js'),
	User = {
		model: require('./user.js')
	},
	Travel = {
		model: require('./travel.js')
	};

var model = mongoose.model('Join', schema);

model.toObject = function(join) {
	return {
		id: join._id.toString(),
		created: join.created,
		updated: join.updated,
		user: User.model.toObject(join.user[0]),
		travel: Travel.model.toObject(join.travel[0])
	};
};

module.exports = model;
