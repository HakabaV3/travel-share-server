var mongoose = require('../model/db.js'),
	User = {
		schema: require('../schema/user.js')
	};

module.exports = new mongoose.Schema({
	created: {
		type: Date,
		default: Date.now
	},
	updated: {
		type: Date,
		default: Date.now
	},
	userId: String,
	token: String
});
