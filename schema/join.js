var mongoose = require('../model/db.js'),
	User = {
		schema: require('../schema/user.js')
	},
	Travel = {
		schema: require('../schema/travel.js')
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
	deleted: {
		type: Boolean,
		default: false
	},
	user: [User.schema],
	travel: [Travel.schema]
});
