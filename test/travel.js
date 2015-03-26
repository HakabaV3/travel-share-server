var APIError = require('../model/apierror.js'),
	mocha = require('mocha'),
	util = require('./util.js'),
	seed = require('../seed/travel.js');

describe('/travel', function() {

	var result;

	it('setup', function(done) {
		seed(function(err, result_) {
			result = result_;
			done(err, result);
		});
	});

	describe('GET /travel/:travelId', function() {
		it('通常', function(done) {
			var token;

			util.post('/auth/user1', {
				password: 'user1_password'
			}, function(err, res, body) {
				token = body.result.token;

				util.get('/travel/' + result[2]._id, function(err, res, body) {
					util.assertIsOK(body);
					util.assertIsTravel(body.result, 'get1_name');
					done();
				}, {
					headers: {
						'X-Token': token
					}
				});
			});
		});

		it('"travel"が存在しない', function(done) {
			var token;

			util.post('/auth/user1', {
				password: 'user1_password'
			}, function(err, res, body) {
				token = body.result.token;

				util.get('/travel/123456789012345678901234', function(err, res, body) {
					util.assertIsNG(body, APIError.notFound(['travel']));
					done();
				}, {
					headers: {
						'X-Token': token
					}
				});
			});
		});

		it('未認証状態', function(done) {
			util.get('/travel/' + result[2]._id, function(err, res, body) {
				util.assertIsOK(body);
				util.assertIsTravel(body.result, 'get1_name');
				util.assert.equal(body.result.members.length, 0);
				util.assert.equal(body.result.places.length, 0);
				done();
			});
		})
	});

	describe('POST /travel', function() {
		it('通常', function(done) {
			var token,
				user;

			util.post('/auth/user1', {
				password: 'user1_password'
			}, function(err, res, body) {
				token = body.result.token;
				user = body.result.user;

				util.post('/travel', {
					name: 'post1_name'
				}, function(err, res, body) {
					util.assertIsOK(body);
					util.assertIsTravel(body.result, 'post1_name');
					util.assert.deepEqual(body.result.members[0], user);
					util.assert.equal(body.result.members.length, 1);
					done();
				}, {
					headers: {
						'X-Token': token
					}
				});
			});
		});

		it('"name"が指定されていない', function(done) {
			var token;

			util.post('/auth/user1', {
				password: 'user1_password'
			}, function(err, res, body) {
				token = body.result.token;

				util.post('/travel', {}, function(err, res, body) {
					util.assertIsNG(body, APIError.invalidParameter(['name']));
					done();
				}, {
					headers: {
						'X-Token': token
					}
				});
			});
		});

		it('未認証状態', function(done) {
			util.post('/travel', {
				name: 'post1_name'
			}, function(err, res, body) {
				util.assertIsNG(body, APIError.mustAuthorized());
				done();
			});
		});
	});

	describe('PATCH /travel', function() {
		var travel;

		it('通常', function(done) {
			var token;

			util.post('/auth/user1', {
				password: 'user1_password'
			}, function(err, res, body) {
				token = body.result.token;

				util.post('/travel', {
					name: 'patch1_name'
				}, function(err, res, body) {
					travel = body.result;

					util.patch('/travel/' + travel.id, {
						name: 'patch1_name_edited'
					}, function(err, res, body) {
						util.assertIsOK(body);
						util.assertIsTravel(body.result, 'patch1_name_edited');
						done();
					}, {
						headers: {
							'X-Token': token
						}
					});
				}, {
					headers: {
						'X-Token': token
					}
				});
			});
		});

		it('"travel"が存在しない', function(done) {
			var token;

			util.post('/auth/user1', {
				password: 'user1_password'
			}, function(err, res, body) {
				token = body.result.token;

				util.patch('/travel/123456789012345678901234', {
					name: 'unknown_name_edited'
				}, function(err, res, body) {
					util.assertIsNG(body, APIError.notFound(['travel']));
					done();
				}, {
					headers: {
						'X-Token': token
					}
				});
			});
		});

		it('未認証状態', function(done) {
			util.patch('/travel/' + travel.id, {
				name: 'travel1_name_edited2'
			}, function(err, res, body) {
				util.assertIsNG(body, APIError.mustAuthorized());
				done();
			});
		});

		it('認証しているが、編集権のない旅行を編集しようとした', function(done) {
			var token;

			util.post('/auth/user2', {
				password: 'user2_password'
			}, function(err, res, body) {
				token = body.result.token;

				util.patch('/travel/' + travel.id, {
					name: 'disallow_action'
				}, function(err, res, body) {
					util.assertIsNG(body, APIError.permissionDenied());
					done();
				}, {
					headers: {
						'X-Token': token
					}
				});
			});
		});
	});
});
