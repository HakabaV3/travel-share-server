var mongoose = require('./db.js'),
	schema = require('../schema/user.js');

var model = mongoose.model('User', schema);

model.toObject = function(user) {
	return {
		id: user._id.toString(),
		created: user.created,
		updated: user.updated,
		userId: user.userId,
		name: user.name
	};
};

module.exports = model;
