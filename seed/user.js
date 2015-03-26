var User = require('../model/user.js'),
	Auth = require('../model/auth.js');

module.exports = function(callback) {
	User.remove({}, function() {
		Auth.remove({}, function() {
			create([{
					userId: 'get1',
					password: 'get1_password',
					name: 'get1_name'
				}, {
					userId: 'patch1',
					password: 'patch1_password',
					name: 'patch1_name'
				}, {
					userId: 'patch2',
					password: 'patch2_password',
					name: 'patch2_name'
				}])
				.then(callback)
				.catch(callback);
		});
	});
}

function create(params) {
	return new Promise(function(resolve, reject) {
		var result = [],
			loop = function() {
				var param = params.shift();
				if (!param) return resolve(null, result);

				new User(param)
					.save(function(err, user) {
						if (err) {
							reject(err, null);
						} else {
							result.push(user);
							loop();
						}
					});
			}
		loop();
	});
}
