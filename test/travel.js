var APIError = require('../model/apierror.js'),
	mocha = require('mocha'),
	util = require('./util.js'),
	User = require('../model/user.js'),
	Auth = require('../model/auth.js'),
	Travel = require('../model/travel.js');

var travel1_id,
	travel2_id;

beforeEach(function(done) {
	Auth.remove({}).exec()
		.then(function() {
			return User.remove({}).exec()
		})
		.then(function() {
			return Travel.remove({}).exec()
		})
		.then(function() {
			return User.create({
				userId: 'kikurage',
				name: 'kikurage_name',
				password: 'kikurage_password'
			}, {
				userId: 'stogu',
				name: 'stogu_name',
				password: 'stogu_password'
			});
		})
		.then(function() {
			return Travel.create({
				name: 'travel1_name',
				members: ['kikurage'],
				places: ['place1']
			});
		})
		.then(function(travel1) {
			travel1_id = travel1.id;
		})
		.then(function() {
			return Travel.create({
				name: 'trave2_name',
				members: ['stogu'],
				places: ['place2']
			});
		})
		.then(function(travel2) {
			travel2_id = travel2.id;
			done()
		})
		.end(done);
});

describe('/travel', function() {

	describe('GET /travel/:travelId', function() {
		it('通常', function(done) {
			var kikurage_token;

			util.post('/auth/kikurage', {
				password: 'kikurage_password'
			}, function(err, res, body) {
				util.assertIsAuth(body, 'kikurage', 'kikurage_name');
				kikurage_token = body.result.token;

				util.get('/travel/' + travel1_id, function(err, res, body) {
					util.assertIsTravel(body, 'travel1_name');
					done();
				}, {
					headers: {
						'X-Token': kikurage_token
					}
				});
			});
		});

		it('"travel"が存在しない', function(done) {
			var kikurage_token;

			util.post('/auth/kikurage', {
				password: 'kikurage_password'
			}, function(err, res, body) {
				util.assertIsAuth(body, 'kikurage', 'kikurage_name');
				kikurage_token = body.result.token;

				util.get('/travel/123456789012345678901234', function(err, res, body) {
					util.assertIsNG(body, APIError.notFound(['travel']));
					done();
				}, {
					headers: {
						'X-Token': kikurage_token
					}
				});
			});
		});

		it('"X-Token"が存在しない', function(done) {
			var kikurage_token;

			util.post('/auth/kikurage', {
				password: 'kikurage_password'
			}, function(err, res, body) {
				util.assertIsAuth(body, 'kikurage', 'kikurage_name');
				kikurage_token = body.result.token;

				util.get('/travel/' + travel1_id, function(err, res, body) {
					util.assertIsTravel(body);
					util.assert.equal(body.result.members.length, 0);
					util.assert.equal(body.result.places.length, 0);
					done();
				});
			});
		});

		it('"X-Token"が空', function(done) {
			var kikurage_token;

			util.post('/auth/kikurage', {
				password: 'kikurage_password'
			}, function(err, res, body) {
				util.assertIsAuth(body, 'kikurage', 'kikurage_name');
				kikurage_token = body.result.token;

				util.get('/travel/' + travel1_id, function(err, res, body) {
					util.assertIsTravel(body);
					util.assert.equal(body.result.members.length, 0);
					util.assert.equal(body.result.places.length, 0);
					done();
				}, {
					headers: {
						'X-Token': ''
					}
				});
			});
		});

		it('"X-Token"が間違っている', function(done) {
			var kikurage_token;

			util.post('/auth/kikurage', {
				password: 'kikurage_password'
			}, function(err, res, body) {
				util.assertIsAuth(body, 'kikurage', 'kikurage_name');
				kikurage_token = body.result.token;

				util.get('/travel/' + travel1_id, function(err, res, body) {
					util.assertIsTravel(body);
					util.assert.equal(body.result.members.length, 0);
					util.assert.equal(body.result.places.length, 0);
					done();
				}, {
					headers: {
						'X-Token': 'invalid'
					}
				});
			});
		});

		it('メンバーでない旅行の情報を取得しようとした', function(done) {
			var kikurage_token;

			util.post('/auth/kikurage', {
				password: 'kikurage_password'
			}, function(err, res, body) {
				util.assertIsAuth(body, 'kikurage', 'kikurage_name');
				kikurage_token = body.result.token;

				util.get('/travel/' + travel2_id, function(err, res, body) {
					util.assertIsTravel(body);
					util.assert.equal(body.result.members.length, 0);
					util.assert.equal(body.result.places.length, 0);
					done();
				}, {
					headers: {
						'X-Token': kikurage_token
					}
				});
			});
		});
	});

	describe('GET /travel', function() {
		it('通常', function(done) {
			var kikurage_token;

			util.post('/auth/kikurage', {
				password: 'kikurage_password'
			}, function(err, res, body) {
				util.assertIsAuth(body, 'kikurage', 'kikurage_name');
				kikurage_token = body.result.token;

				util.get('/travel', function(err, res, body) {
					util.assertIsTravels(body);
					done();
				}, {
					headers: {
						'X-Token': kikurage_token
					}
				});
			});
		});
	});

	describe('POST /travel', function() {
		it('通常', function(done) {
			var kikurage_token,
				travel3_id;

			util.post('/auth/kikurage', {
				password: 'kikurage_password'
			}, function(err, res, body) {
				util.assertIsAuth(body, 'kikurage', 'kikurage_name');
				kikurage_token = body.result.token;

				util.post('/travel', {
					name: 'travel3_name'
				}, function(err, res, body) {
					util.assertIsTravel(body, 'travel3_name');
					travel3_id = body.result.id;

					util.get('/travel/' + travel3_id, function(err, res, body) {
						util.assertIsTravel(body, 'travel3_name');
						done();
					}, {
						headers: {
							'X-Token': kikurage_token
						}
					});
				}, {
					headers: {
						'X-Token': kikurage_token
					}
				});
			});
		});

		it('"name"が指定されていない', function(done) {
			var kikurage_token,
				travel3_id;

			util.post('/auth/kikurage', {
				password: 'kikurage_password'
			}, function(err, res, body) {
				util.assertIsAuth(body, 'kikurage', 'kikurage_name');
				kikurage_token = body.result.token;

				util.post('/travel', {}, function(err, res, body) {
					util.assertIsNG(body, APIError.invalidParameter(['name']));
					done();
				}, {
					headers: {
						'X-Token': kikurage_token
					}
				});
			});
		});

		it('"X-Token"が存在しない', function(done) {
			var kikurage_token,
				travel3_id;

			util.post('/auth/kikurage', {
				password: 'kikurage_password'
			}, function(err, res, body) {
				util.assertIsAuth(body, 'kikurage', 'kikurage_name');
				kikurage_token = body.result.token;

				util.post('/travel', {
					name: 'travel3_name'
				}, function(err, res, body) {
					util.assertIsNG(body, APIError.mustAuthorized());
					done();
				});
			});
		});

		it('"X-Token"が空', function(done) {
			var kikurage_token,
				travel3_id;

			util.post('/auth/kikurage', {
				password: 'kikurage_password'
			}, function(err, res, body) {
				util.assertIsAuth(body, 'kikurage', 'kikurage_name');
				kikurage_token = body.result.token;

				util.post('/travel', {
					name: 'travel3_name'
				}, function(err, res, body) {
					util.assertIsNG(body, APIError.mustAuthorized());
					done();
				}, {
					headers: {
						'X-Token': ''
					}
				});
			});
		});

		it('"X-Token"が間違っている', function(done) {
			var kikurage_token,
				travel3_id;

			util.post('/auth/kikurage', {
				password: 'kikurage_password'
			}, function(err, res, body) {
				util.assertIsAuth(body, 'kikurage', 'kikurage_name');
				kikurage_token = body.result.token;

				util.post('/travel', {
					name: 'travel3_name'
				}, function(err, res, body) {
					util.assertIsNG(body, APIError.mustAuthorized());
					done();
				}, {
					headers: {
						'X-Token': 'invalid'
					}
				});
			});
		});
	});

	describe('PATCH /travel', function() {
		var travel;

		it('通常', function(done) {
			var kikurage_token;

			util.post('/auth/kikurage', {
				password: 'kikurage_password'
			}, function(err, res, body) {
				util.assertIsAuth(body, 'kikurage', 'kikurage_name');
				kikurage_token = body.result.token;

				util.patch('/travel/' + travel1_id, {
					name: 'travel1_name_edited'
				}, function(err, res, body) {
					util.assertIsTravel(body, 'travel1_name_edited');

					util.get('/travel/' + travel1_id, function(err, res, body) {
						util.assertIsTravel(body, 'travel1_name_edited');
						done();
					}, {
						headers: {
							'X-Token': kikurage_token
						}
					});
				}, {
					headers: {
						'X-Token': kikurage_token
					}
				});
			});
		});

		it('"travel"が存在しない', function(done) {
			var kikurage_token;

			util.post('/auth/kikurage', {
				password: 'kikurage_password'
			}, function(err, res, body) {
				util.assertIsAuth(body, 'kikurage', 'kikurage_name');
				kikurage_token = body.result.token;

				util.patch('/travel/123456789012345678901234', {
					name: 'travel1_name_edited'
				}, function(err, res, body) {
					util.assertIsNG(body, APIError.notFound(['travel']));
					done();
				}, {
					headers: {
						'X-Token': kikurage_token
					}
				});
			});
		});

		it('"X-Token"が存在しない', function(done) {
			var kikurage_token;

			util.post('/auth/kikurage', {
				password: 'kikurage_password'
			}, function(err, res, body) {
				util.assertIsAuth(body, 'kikurage', 'kikurage_name');
				kikurage_token = body.result.token;

				util.patch('/travel/' + travel1_id, {
					name: 'travel1_name_edited'
				}, function(err, res, body) {
					util.assertIsNG(body, APIError.mustAuthorized());
					done();
				});
			});
		});

		it('"X-Token"が空', function(done) {
			var kikurage_token;

			util.post('/auth/kikurage', {
				password: 'kikurage_password'
			}, function(err, res, body) {
				util.assertIsAuth(body, 'kikurage', 'kikurage_name');
				kikurage_token = body.result.token;

				util.patch('/travel/' + travel1_id, {
					name: 'travel1_name_edited'
				}, function(err, res, body) {
					util.assertIsNG(body, APIError.mustAuthorized());
					done();
				}, {
					headers: {
						'X-Token': ''
					}
				});
			});
		});

		it('"X-Token"が間違っている', function(done) {
			var kikurage_token;

			util.post('/auth/kikurage', {
				password: 'kikurage_password'
			}, function(err, res, body) {
				util.assertIsAuth(body, 'kikurage', 'kikurage_name');
				kikurage_token = body.result.token;

				util.patch('/travel/' + travel1_id, {
					name: 'travel1_name_edited'
				}, function(err, res, body) {
					util.assertIsNG(body, APIError.mustAuthorized());
					done();
				}, {
					headers: {
						'X-Token': 'invalid'
					}
				});
			});
		});

		it('認証しているが、編集権のない旅行を編集しようとした', function(done) {
			var kikurage_token;

			util.post('/auth/kikurage', {
				password: 'kikurage_password'
			}, function(err, res, body) {
				util.assertIsAuth(body, 'kikurage', 'kikurage_name');
				kikurage_token = body.result.token;

				util.patch('/travel/' + travel2_id, {
					name: 'travel2_name_edited'
				}, function(err, res, body) {
					util.assertIsNG(body, APIError.permissionDenied());
					done();
				}, {
					headers: {
						'X-Token': kikurage_token
					}
				});
			});
		});
	});
});
