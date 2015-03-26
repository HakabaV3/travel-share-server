var APIError = require('../model/apierror.js'),
	mocha = require('mocha'),
	util = require('./util.js'),
	seed = require('../seed/auth.js');

//@TODO 削除されたユーザーでログイン出来ないか確認する。
describe('/auth', function() {

	var token;

	it('setup', function(done) {
		seed(done);
	});

	describe('POST /auth/:userId', function() {
		it('通常', function(done) {
			util.post('/auth/auth_test', {
				password: 'auth_test_password'
			}, function(err, res, body) {
				util.assertIsOK(body);
				util.assertIsAuth(body.result, 'auth_test');
				token = body.result.token;
				done();
			});
		});

		it('"password"が違う', function(done) {
			util.post('/auth/auth_test', {
				password: 'invalid'
			}, function(err, res, body) {
				util.assertIsNG(body, APIError.invalidParameter(['userId', 'password']));
				done();
			});
		});

		it('"password"がない', function(done) {
			util.post('/auth/auth_test', {}, function(err, res, body) {
				util.assertIsNG(body, APIError.invalidParameter(['userId', 'password']));
				done();
			});
		});

		it('"userId"が違う', function(done) {
			util.post('/auth/unknown', {
				password: 'auth_test_password'
			}, function(err, res, body) {
				util.assertIsNG(body, APIError.invalidParameter(['userId', 'password']));
				done();
			});
		});

		it('"userId"がない', function(done) {
			util.post('/auth', {
				password: 'auth_test_password'
			}, function(err, res, body) {
				util.assertIsNG(body, APIError.notFound());
				done();
			});
		});

		it('"userId"も"password"も違う', function(done) {
			util.post('/auth/unknown', {
				password: 'invalid'
			}, function(err, res, body) {
				util.assertIsNG(body, APIError.invalidParameter(['userId', 'password']));
				done();
			});
		});

		it('tokenつきだけども、"password"が違う', function(done) {
			util.post('/auth/auth_test', {
				password: 'invalid'
			}, function(err, res, body) {
				util.assertIsNG(body, APIError.invalidParameter(['userId', 'password']));
				done();
			}, {
				headers: {
					'X-Token': token
				}
			});
		});

		it('tokenつきだけども、"password"がない', function(done) {
			util.post('/auth/auth_test', {}, function(err, res, body) {
				util.assertIsNG(body, APIError.invalidParameter(['userId', 'password']));
				done();
			}, {
				headers: {
					'X-Token': token
				}
			});
		});

		it('tokenつきだけども、"userId"が違う', function(done) {
			util.post('/auth/unknown', {
				password: 'auth_test_password'
			}, function(err, res, body) {
				util.assertIsNG(body, APIError.invalidParameter(['userId', 'password']));
				done();
			}, {
				headers: {
					'X-Token': token
				}
			});
		});

		it('tokenつきだけども、"userId"がない', function(done) {
			util.post('/auth', {
				password: 'auth_test_password'
			}, function(err, res, body) {
				util.assertIsNG(body, APIError.notFound());
				done();
			}, {
				headers: {
					'X-Token': token
				}
			});
		});

		it('tokenつきだけども、"userId"も"password"も違う', function(done) {
			util.post('/auth/unknown', {
				password: 'invalid'
			}, function(err, res, body) {
				util.assertIsNG(body, APIError.invalidParameter(['userId', 'password']));
				done();
			}, {
				headers: {
					'X-Token': token
				}
			});
		});
	});

	describe('GET /auth', function() {
		it('通常', function(done) {
			util.get('/auth', function(err, res, body) {
				util.assertIsOK(body);
				util.assertIsAuth(body.result, 'auth_test');
				done();
			}, {
				headers: {
					'X-Token': token
				}
			});
		})

		it('"X-Token"が存在しない', function(done) {
			util.get('/auth', function(err, res, body) {
				util.assertIsNG(body, APIError.notFound(['auth']));
				done();
			});
		});

		it('"X-Token"が空', function(done) {
			util.get('/auth', function(err, res, body) {
				util.assertIsNG(body, APIError.notFound(['auth']));
				done();
			});
		}, {
			headers: {
				'X-Token': ''
			}
		});

		it('"X-Token"が間違っている', function(done) {
			util.get('/auth', function(err, res, body) {
				util.assertIsNG(body, APIError.notFound(['auth']));
				done();
			});
		}, {
			headers: {
				'X-Token': 'invalid'
			}
		});
	});

	describe('DELETE /auth', function() {
		it('通常', function(done) {
			util.delete('/auth', function(err, res, body) {
				util.assertIsOK(body);
				util.assert.deepEqual(body.result, {});

				util.get('/auth', function(err, res, body) {
					util.assertIsNG(body, APIError.notFound(['auth']));
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

		it('"X-Token"が存在しない', function(done) {
			util.delete('/auth', function(err, res, body) {
				util.assertIsOK(body);
				util.assert.deepEqual(body.result, {});
				done();
			});
		});

		it('"X-Token"が空', function(done) {
			util.delete('/auth', function(err, res, body) {
				util.assertIsOK(body);
				util.assert.deepEqual(body.result, {});
				done();
			}, {
				headers: {
					'X-Token': ''
				}
			});
		});

		it('"token"がすでに無効化されている', function(done) {
			util.delete('/auth', function(err, res, body) {
				util.assertIsOK(body);
				util.assert.deepEqual(body.result, {});
				done();
			}, {
				headers: {
					'X-Token': token
				}
			});
		});
	});
});
