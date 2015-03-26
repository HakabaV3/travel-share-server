var APIError = require('../model/apierror.js'),
	mocha = require('mocha'),
	util = require('./util.js'),
	User = require('../model/user.js'),
	Auth = require('../model/auth.js');

beforeEach(function(done) {
	Auth.remove({}).exec()
		.then(function() {
			return User.remove({}).exec()
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
			})
		})
		.then(function() {
			done()
		})
		.end(done);
});

//@TODO 削除されたユーザーでログイン出来ないか確認する。
describe('/auth', function() {

	describe('POST /auth/:userId', function() {
		it('通常', function(done) {
			util.post('/auth/kikurage', {
				password: 'kikurage_password'
			}, function(err, res, body) {
				util.assertIsAuth(body, 'kikurage', 'kikurage_name');
				done();
			});
		});

		it('"password"が違う', function(done) {
			util.post('/auth/kikurage', {
				password: 'invalid'
			}, function(err, res, body) {
				util.assertIsNG(body, APIError.invalidParameter(['userId', 'password']));
				done();
			});
		});

		it('"password"がない', function(done) {
			util.post('/auth/kikurage', {}, function(err, res, body) {
				util.assertIsNG(body, APIError.invalidParameter(['userId', 'password']));
				done();
			});
		});

		it('"user"が存在しない', function(done) {
			util.post('/auth/unknown', {
				password: 'kikurage_password'
			}, function(err, res, body) {
				util.assertIsNG(body, APIError.invalidParameter(['userId', 'password']));
				done();
			});
		});

		it('"user"が存在しないし、"password"も違う', function(done) {
			util.post('/auth/unknown', {
				password: 'invalid'
			}, function(err, res, body) {
				util.assertIsNG(body, APIError.invalidParameter(['userId', 'password']));
				done();
			});
		});

		it('tokenつきだけども、"password"が違う', function(done) {
			var kikurage_token;

			util.post('/auth/kikurage', {
				password: 'kikurage_password'
			}, function(err, res, body) {
				util.assertIsAuth(body, 'kikurage', 'kikurage_name');
				kikurage_token = body.result.token;

				util.post('/auth/kikurage', {
					password: 'invalid'
				}, function(err, res, body) {
					util.assertIsNG(body, APIError.invalidParameter(['userId', 'password']));
					done();
				}, {
					headers: {
						'X-Token': kikurage_token
					}
				});

			});
		});

		it('tokenつきだけども、"password"がない', function(done) {
			var kikurage_token;

			util.post('/auth/kikurage', {
				password: 'kikurage_password'
			}, function(err, res, body) {
				util.assertIsAuth(body, 'kikurage', 'kikurage_name');
				kikurage_token = body.result.token;

				util.post('/auth/kikurage', {}, function(err, res, body) {
					util.assertIsNG(body, APIError.invalidParameter(['userId', 'password']));
					done();
				}, {
					headers: {
						'X-Token': kikurage_token
					}
				});

			});
		});

		it('tokenつきだけども、"user"が存在しない', function(done) {
			var kikurage_token;

			util.post('/auth/kikurage', {
				password: 'kikurage_password'
			}, function(err, res, body) {
				util.assertIsAuth(body, 'kikurage', 'kikurage_name');
				kikurage_token = body.result.token;

				util.post('/auth/unknown', {
					password: 'kikurage_password'
				}, function(err, res, body) {
					util.assertIsNG(body, APIError.invalidParameter(['userId', 'password']));
					done();
				}, {
					headers: {
						'X-Token': kikurage_token
					}
				});

			});
		});

		it('tokenつきだけども、"user"が存在しないし、"password"も違う', function(done) {
			var kikurage_token;

			util.post('/auth/kikurage', {
				password: 'kikurage_password'
			}, function(err, res, body) {
				util.assertIsAuth(body, 'kikurage', 'kikurage_name');
				kikurage_token = body.result.token;

				util.post('/auth/unknown', {
					password: 'invalid'
				}, function(err, res, body) {
					util.assertIsNG(body, APIError.invalidParameter(['userId', 'password']));
					done();
				}, {
					headers: {
						'X-Token': kikurage_token
					}
				});

			});
		});
	});

	describe('GET /auth', function() {
		it('通常', function(done) {
			var kikurage_token;

			util.post('/auth/kikurage', {
				password: 'kikurage_password'
			}, function(err, res, body) {
				util.assertIsAuth(body, 'kikurage', 'kikurage_name');
				kikurage_token = body.result.token;

				util.get('/auth', function(err, res, body) {
					util.assertIsAuth(body, 'kikurage', 'kikurage_name');
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

			util.get('/auth', function(err, res, body) {
				util.assertIsNG(body, APIError.notFound(['auth']));
				done();
			});
		});

		it('"X-Token"が空', function(done) {
			var kikurage_token;

			util.get('/auth', function(err, res, body) {
				util.assertIsNG(body, APIError.notFound(['auth']));
				done();
			}, {
				headers: {
					'X-Token': ''
				}
			});
		});

		it('"X-Token"が間違っている', function(done) {
			var kikurage_token;

			util.get('/auth', function(err, res, body) {
				util.assertIsNG(body, APIError.notFound(['auth']));
				done();
			}, {
				headers: {
					'X-Token': 'invalid'
				}
			});
		});
	});

	describe('DELETE /auth', function() {
		it('通常', function(done) {
			var kikurage_token;

			util.post('/auth/kikurage', {
				password: 'kikurage_password'
			}, function(err, res, body) {
				util.assertIsAuth(body, 'kikurage', 'kikurage_name');
				kikurage_token = body.result.token;

				util.delete('/auth', function(err, res, body) {
					util.assertIsEmpty(body);

					util.get('/auth', function(err, res, body) {
						util.assertIsNG(body, APIError.notFound(['auth']));
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

		it('"X-Token"が存在しない', function(done) {
			var kikurage_token;

			util.post('/auth/kikurage', {
				password: 'kikurage_password'
			}, function(err, res, body) {
				util.assertIsAuth(body, 'kikurage', 'kikurage_name');
				kikurage_token = body.result.token;

				util.delete('/auth', function(err, res, body) {
					util.assertIsEmpty(body);

					util.get('/auth', function(err, res, body) {
						util.assertIsAuth(body, 'kikurage', 'kikurage_name');
						done();
					}, {
						headers: {
							'X-Token': kikurage_token
						}
					});
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

				util.delete('/auth', function(err, res, body) {
					util.assertIsEmpty(body);

					util.get('/auth', function(err, res, body) {
						util.assertIsAuth(body, 'kikurage', 'kikurage_name');
						done();
					}, {
						headers: {
							'X-Token': kikurage_token
						}
					});
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

				util.delete('/auth', function(err, res, body) {
					util.assertIsEmpty(body);

					util.get('/auth', function(err, res, body) {
						util.assertIsAuth(body, 'kikurage', 'kikurage_name');
						done();
					}, {
						headers: {
							'X-Token': kikurage_token
						}
					});
				}, {
					headers: {
						'X-Token': 'invalid'
					}
				});
			});
		});

		it('"token"がすでに無効化されている', function(done) {
			var kikurage_token;

			util.post('/auth/kikurage', {
				password: 'kikurage_password'
			}, function(err, res, body) {
				util.assertIsAuth(body, 'kikurage', 'kikurage_name');
				kikurage_token = body.result.token;

				util.delete('/auth', function(err, res, body) {
					util.assertIsEmpty(body);

					util.get('/auth', function(err, res, body) {
						util.assertIsNG(body, APIError.notFound(['auth']));

						util.delete('/auth', function(err, res, body) {
							util.assertIsEmpty(body);

							util.get('/auth', function(err, res, body) {
								util.assertIsNG(body, APIError.notFound(['auth']));
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
	});
});
