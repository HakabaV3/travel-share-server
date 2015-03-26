var Travel = require('../model/travel.js'),
	Auth = require('../model/auth.js'),
	User = require('../model/user.js');

module.exports = function(callback) {
	Travel.remove({}, function() {
		Auth.remove({}, function() {
			create([{
					model: User,
					userId: 'user1',
					name: 'user1_name',
					password: 'user1_password'
				}, {
					model: User,
					userId: 'user2',
					name: 'user2_name',
					password: 'user2_password'
				}, {
					model: Travel,
					name: 'get1_name'
				}])
				.then(function(data) {
					callback(data.err, data.result);
				})
				.catch(function(data) {
					callback(data.err, data.result);
				});
		});
	});
}

function create(params) {
	return new Promise(function(resolve, reject) {
		var result = [],
			loop = function() {
				var param = params.shift();
				if (!param) return resolve({
					err: null,
					result: result
				});

				new param.model(param)
					.save(function(err, travel) {
						if (err) {
							reject({
								err: err,
								result: null
							});
						} else {
							result.push(travel);
							loop();
						}
					});
			}
		loop();
	});
}
