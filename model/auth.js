var mongoose = require('./db.js'),
	schema = require('../schema/auth.js'),
	User = {
		model: require('./user.js')
	};

var model = mongoose.model('Auth', schema);

model.toObject = function(auth) {
	return {
		id: auth._id.toString(),
		created: auth.created,
		updated: auth.updated,
		user: User.model.toObject(auth.user[0]),
		token: auth.token
	};
};

module.exports = model;
