var mongoose = require('../model/db.js');

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
	address_components: [{
		long_name: Number,
		short_name: Number,
		types: [String]
	}],
	events: [{
		event_id: String,
		start_time: Number,
		summary: String,
		url: String
	}],
	formatted_address: String,
	formatted_phone_number: String,
	geometry: {
		location: {
			lat: Number,
			lng: Number
		}
	},
	icon: String,
	id: String,
	international_phone_number: String,
	name: String,
	rating: Number,
	reference: String,
	reviews: [{
		aspects: [{
			rating: Number,
			type: String,
		}],
		author_name: String,
		author_url: String,
		text: String,
		time: Number
	}],
	types: [String],
	url: String,
	vicinity: String,
	website: String
});
