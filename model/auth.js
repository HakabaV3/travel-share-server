var mongoose = require('./db.js'),
	schema = require('../schema/auth.js'),
	User = {
		model: require('./user.js')
	};

var model = mongoose.model('Auth', schema);


model.toObject = function(auth, callback) {
	User.model.findOne({
		userId: auth.userId,
		deleted: false
	}, function(err, user) {
		if (err) {
			return callback(err, null);
		}

		User.model.toObject(user, function(err, user) {
			if (err) {
				return callback(err, null);
			}

			return callback(null, {
				id: auth._id.toString(),
				created: auth.created,
				updated: auth.updated,
				user: user,
				token: auth.token
			});
		})
	});
};

module.exports = model;
