var mongoose = require('../model/db.js'),
	User = {
		schema: require('./user.js')
	},
	Place = {
		schema: require('./place.js')
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
	name: String,
	members: [String],
	places: [String]
});
