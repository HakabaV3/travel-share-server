var User = require('../model/user.js'),
	Auth = require('../model/auth.js');

module.exports = function(callback) {
	User.remove({}, function() {
		Auth.remove({}, function() {
			new User({
					userId: 'auth_test',
					password: 'auth_test_password',
					name: 'auth_test_name'
				})
				.save(callback)
		});
	});
};
