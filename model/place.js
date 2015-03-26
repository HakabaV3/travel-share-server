var mongoose = require('./db.js'),
	schema = require('../schema/place.js');

var model = mongoose.model('Place', schema);

model.toObject = function(place) {
	return {
		id: place._id.toString(),
		created: place.created,
		updated: place.updated,
		address_components: place.address_components.map(function(component) {
			return {
				long_name: component.long_ame,
				short_name: component.short_name,
				types: component.types.slice(0)
			};
		}),
		events: place.events.map(function(event) {
			return {
				event_id: events.event_id,
				start_time: events.start_time,
				summary: events.summary,
				url: events.uri
			};
		}),
		formatted_address: place.formatted_address,
		formatted_phone_number: place.formatted_phone_number,
		geometry: {
			location: {
				lat: place.geometry.location.lat,
				lng: place.geometry.location.lng
			}
		},
		icon: place.icon,
		id: place.id,
		international_phone_number: place.international_phone_number,
		name: place.name,
		rating: place.rating,
		reference: place.reference,
		reviews: place.reviews.map(function(review) {
			return {
				aspects: reviews.aspects.map(function(aspect) {
					return {
						rating: aspect.rating,
						type: aspect.type
					};
				}),
				author_name: aspect.author_name,
				author_url: aspect.author_url,
				text: aspect.text,
				time: aspect.time
			};
		}),
		types: place.types.slice(0),
		url: place.url,
		vicinity: place.vicinity,
		website: place.website
	}
};

module.exports = model;
