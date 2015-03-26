var APIError = require('../model/apierror.js'),
	mocha = require('mocha'),
	util = require('./util.js'),
	User = require('../model/user.js');

beforeEach(function(done) {
	User.remove({}).exec()
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

describe('/user', function() {
	describe('GET /user/:userId', function() {
		it('通常', function(done) {
			util.get('/user/kikurage', function(err, res, body) {
				util.assertIsUser(body, 'kikurage', 'kikurage_name');
				done();
			});
		})

		it('"user"が存在しない', function(done) {
			util.get('/user/unknown', function(err, res, body) {
				util.assertIsNG(body, APIError.notFound(['user']));
				done();
			});
		});
	});

	describe('POST /user/:userId', function() {
		it('通常', function(done) {
			util.post('/user/jinssk', {
				name: 'jinssk_name',
				password: 'jinssk_password'
			}, function(err, res, body) {
				util.assertIsUser(body, 'jinssk', 'jinssk_name');
				done();
			});
		});

		it('"name"が指定されていない', function(done) {
			util.post('/user/jinssk', {
				password: 'jinssk_password'
			}, function(err, res, body) {
				util.assertIsNG(body, APIError.invalidParameter(['name']));
				done();
			});
		});

		it('"password"が指定されていない', function(done) {
			util.post('/user/jinssk', {
				name: 'jinssk_password'
			}, function(err, res, body) {
				util.assertIsNG(body, APIError.invalidParameter(['password']));
				done();
			});
		});

		it('"name"も"password"も指定されていない', function(done) {
			util.post('/user/jinssk', {}, function(err, res, body) {
				util.assertIsNG(body, APIError.invalidParameter(['name', 'password']));
				done();
			});
		});

		it('"userId"がすでに使用されている', function(done) {
			util.post('/user/kikurage', {
				name: 'kikurage_name',
				password: 'kikurage_password'
			}, function(err, res, body) {
				util.assertIsNG(body, APIError.alreadyCreated(['userId']));
				done();
			});
		});
	});

	describe('PATCH /user/:userId', function() {
		it('通常', function(done) {
			var kikurage_token;

			util.post('/auth/kikurage', {
				password: 'kikurage_password'
			}, function(err, res, body) {
				util.assertIsAuth(body, 'kikurage', 'kikurage_name');
				kikurage_token = body.result.token;

				util.patch('/user/kikurage', {
					name: 'kikurage_name_edited'
				}, function(err, res, body) {
					util.assertIsUser(body, 'kikurage', 'kikurage_name_edited');
					done();
				}, {
					headers: {
						'X-Token': kikurage_token
					}
				});
			});
		});

		it('"user"が存在しない', function(done) {
			var kikurage_token;

			util.post('/auth/kikurage', {
				password: 'kikurage_password'
			}, function(err, res, body) {
				util.assertIsAuth(body, 'kikurage', 'kikurage_name');
				kikurage_token = body.result.token;

				util.patch('/user/unknown', {
					name: 'unknown_name_edited'
				}, function(err, res, body) {
					util.assertIsNG(body, APIError.notFound(['user']));
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

				util.patch('/user/kikurage', {
					name: 'kikurage_name_edited'
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

				util.patch('/user/kikurage', {
					name: 'kikurage_name_edited'
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

				util.patch('/user/kikurage', {
					name: 'kikurage_name_edited'
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

		it('認証しているが、他人を編集しようとした', function(done) {
			var kikurage_token;

			util.post('/auth/kikurage', {
				password: 'kikurage_password'
			}, function(err, res, body) {
				util.assertIsAuth(body, 'kikurage', 'kikurage_name');
				kikurage_token = body.result.token;

				util.patch('/user/stogu', {
					name: 'stogu_name_edited'
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

	describe('DELETE /user/:userId', function() {
		it('通常', function(done) {
			var kikurage_token;

			util.post('/auth/kikurage', {
				password: 'kikurage_password'
			}, function(err, res, body) {
				util.assertIsAuth(body, 'kikurage', 'kikurage_name');
				kikurage_token = body.result.token;

				util.delete('/user/kikurage', function(err, res, body) {
					util.assertIsEmpty(body);

					//kikurageが削除されていることの確認
					util.get('/user/kikurage', function(err, res, body) {
						util.assertIsNG(body, APIError.notFound(['user']));

						//kikurageのトークンが無効化されていることの確認
						util.get('/auth', function(err, res, body) {
							util.assertIsNG(body, APIError.notFound(['auth']));
							done();
						}, {
							headers: {
								'X-Token': kikurage_token
							}
						});
					});
				}, {
					headers: {
						'X-Token': kikurage_token
					}
				});
			});
		});

		it('"user"が存在しない', function(done) {
			util.post('/auth/kikurage', {
				password: 'kikurage_password'
			}, function(err, res, body) {
				util.assertIsAuth(body, 'kikurage', 'kikurage_name');
				kikurage_token = body.result.token;

				//unknownの削除
				util.delete('/user/unknown', function(err, res, body) {
					util.assertIsNG(body, APIError.notFound(['user']));

					//kikurageが削除されていないことの確認
					util.get('/user/kikurage', function(err, res, body) {
						util.assertIsUser(body, 'kikurage', 'kikurage_name');

						//kikurageのトークンが無効化されていないことの確認
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

				util.delete('/user/kikurage', function(err, res, body) {
					util.assertIsNG(body, APIError.mustAuthorized());

					//kikurageが削除されていないことの確認
					util.get('/user/kikurage', function(err, res, body) {
						util.assertIsUser(body, 'kikurage', 'kikurage_name');

						//kikurageのトークンが無効化されていないことの確認
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
		});

		it('"X-Token"が空', function(done) {
			var kikurage_token;

			util.post('/auth/kikurage', {
				password: 'kikurage_password'
			}, function(err, res, body) {
				util.assertIsAuth(body, 'kikurage', 'kikurage_name');
				kikurage_token = body.result.token;

				util.delete('/user/kikurage', function(err, res, body) {
					util.assertIsNG(body, APIError.mustAuthorized());

					//kikurageが削除されていないことの確認
					util.get('/user/kikurage', function(err, res, body) {
						util.assertIsUser(body, 'kikurage', 'kikurage_name');

						//kikurageのトークンが無効化されていないことの確認
						util.get('/auth', function(err, res, body) {
							util.assertIsAuth(body, 'kikurage', 'kikurage_name');
							done();
						}, {
							headers: {
								'X-Token': kikurage_token
							}
						});
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

				util.delete('/user/kikurage', function(err, res, body) {
					util.assertIsNG(body, APIError.mustAuthorized());

					//kikurageが削除されていないことの確認
					util.get('/user/kikurage', function(err, res, body) {
						util.assertIsUser(body, 'kikurage', 'kikurage_name');

						//kikurageのトークンが無効化されていないことの確認
						util.get('/auth', function(err, res, body) {
							util.assertIsAuth(body, 'kikurage', 'kikurage_name');
							done();
						}, {
							headers: {
								'X-Token': kikurage_token
							}
						});
					});
				}, {
					headers: {
						'X-Token': 'invalid'
					}
				});
			});
		});

		it('認証しているが、他人を削除しようとした', function(done) {
			util.post('/auth/kikurage', {
				password: 'kikurage_password'
			}, function(err, res, body) {
				util.assertIsAuth(body, 'kikurage', 'kikurage_name');
				kikurage_token = body.result.token;

				//stoguの削除
				util.delete('/user/stogu', function(err, res, body) {
					util.assertIsNG(body, APIError.permissionDenied());

					//stoguが削除されていないことの確認
					util.get('/user/stogu', function(err, res, body) {
						util.assertIsUser(body, 'stogu', 'stogu_name');

						//kikurageのトークンが無効化されていないことの確認
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
