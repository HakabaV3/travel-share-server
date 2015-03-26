var APIError = require('../model/apierror.js'),
	mocha = require('mocha'),
	util = require('./util.js'),
	seed = require('../seed/user.js');

describe('/user', function() {
	it('setup', function(done) {
		seed(done);
	});

	describe('GET /user/:userId', function() {
		it('通常', function(done) {
			util.get('/user/get1', function(err, res, body) {
				util.assertIsOK(body);
				util.assertIsUser(body.result, 'get1', 'get1_name');
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
			util.post('/user/post1', {
				name: 'post1_name',
				password: 'post1_name'
			}, function(err, res, body) {
				util.assertIsOK(body);
				util.assertIsUser(body.result, 'post1', 'post1_name');
				done();
			});
		});

		it('"name"が指定されていない', function(done) {
			util.post('/user/post2', {
				password: 'post2_password'
			}, function(err, res, body) {
				util.assertIsNG(body, APIError.invalidParameter(['name']));
				done();
			});
		});

		it('"password"が指定されていない', function(done) {
			util.post('/user/post3', {
				name: 'post3_name'
			}, function(err, res, body) {
				util.assertIsNG(body, APIError.invalidParameter(['password']));
				done();
			});
		});

		it('"name"も"password"も指定されていない', function(done) {
			util.post('/user/post4', {}, function(err, res, body) {
				util.assertIsNG(body, APIError.invalidParameter(['name', 'password']));
				done();
			});
		});

		it('"userId"がすでに使用されている', function(done) {
			util.post('/user/post1', {
				name: 'post5_name',
				password: 'post5_pasword'
			}, function(err, res, body) {
				util.assertIsNG(body, APIError.alreadyCreated(['userId']));
				done();
			});
		});
	});

	describe('PATCH /user/:userId', function() {
		var token_patch1;

		it('通常', function(done) {
			util.post('/auth/patch1', {
				password: 'patch1_password'
			}, function(err, res, body) {
				token_patch1 = body.result.token;

				util.patch('/user/patch1', {
					name: 'patch1_name_edited'
				}, function(err, res, body) {
					util.assertIsOK(body);
					util.assertIsUser(body.result, 'patch1', 'patch1_name_edited');
					done();
				}, {
					headers: {
						'X-Token': token_patch1
					}
				});
			});
		});

		it('"user"が存在しない', function(done) {
			util.patch('/user/unknown', {
				name: 'unknown_name_edited'
			}, function(err, res, body) {
				util.assertIsNG(body, APIError.notFound(['user']));
				done();
			}, {
				headers: {
					'X-Token': token_patch1
				}
			});
		});

		it('未認証状態', function(done) {
			util.patch('/user/patch1', {
				name: 'patch1_name_edited'
			}, function(err, res, body) {
				util.assertIsNG(body, APIError.mustAuthorized());
				done();
			});
		});

		it('認証しているが、他人を編集しようとした', function(done) {
			util.patch('/user/patch2', {
				name: 'patch2_name_edited'
			}, function(err, res, body) {
				util.assertIsNG(body, APIError.permissionDenied());
				done();
			}, {
				headers: {
					'X-Token': token_patch1
				}
			});
		});
	});

	describe('DELETE /user/:userId', function() {

		it('通常', function(done) {
			var token;

			//kikurageの作成
			util.post('/user/kikurage', {
				name: 'kikurage_name',
				password: 'kikurage_password'
			}, function(err, res, body) {

				//kikurageの認証
				util.post('/auth/kikurage', {
					password: 'kikurage_password'
				}, function(err, res, body) {
					token = body.result.token;

					//kikurageの削除
					util.delete('/user/kikurage', function(err, res, body) {
						util.assertIsOK(body);
						util.assert.deepEqual(body.result, {});

						//kikurageが削除されていることの確認
						util.get('/user/kikurage', function(err, res, body) {
							util.assertIsNG(body, APIError.notFound(['user']));

							//kikurageのトークンが無効化されていることの確認
							util.get('/auth', function(err, res, body) {
								util.assertIsNG(body, APIError.notFound(['auth']));
								done();
							}, {
								headers: {
									'X-Token': token
								}
							});
						});
					}, {
						headers: {
							'X-Token': token
						}
					});
				});
			});
		});

		it('"user"が存在しない', function(done) {
			var token;

			//kikurageの作成
			util.post('/user/kikurage', {
				name: 'kikurage_name',
				password: 'kikurage_password'
			}, function(err, res, body) {

				//kikurageの認証
				util.post('/auth/kikurage', {
					password: 'kikurage_password'
				}, function(err, res, body) {
					token = body.result.token;

					//unknownの削除
					util.delete('/user/unknown', function(err, res, body) {
						util.assertIsNG(body, APIError.notFound(['user']));
						done();
					}, {
						headers: {
							'X-Token': token
						}
					});
				});
			});
		});

		it('未認証状態', function(done) {
			var token;

			//kikurageの作成
			util.post('/user/kikurage', {
				name: 'kikurage_name',
				password: 'kikurage_password'
			}, function(err, res, body) {

				//kikurageの認証
				util.post('/auth/kikurage', {
					password: 'kikurage_password'
				}, function(err, res, body) {
					token = body.result.token;

					//unknownの削除(トークンなし = 未認証)
					util.delete('/user/kikurage', function(err, res, body) {
						util.assertIsNG(body, APIError.mustAuthorized());
						done();
					});
				});
			});
		});

		it('認証しているが、他人を削除しようとした', function(done) {
			var token_stogu;

			//kikurageの作成
			util.post('/user/kikurage', {
				name: 'kikurage_name',
				password: 'kikurage_password'
			}, function(err, res, body) {

				//stoguの作成
				util.post('/user/stogu', {
					name: 'stogu_name',
					password: 'stogu_password'
				}, function(err, res, body) {

					//stoguの認証
					util.post('/auth/stogu', {
						password: 'stogu_password'
					}, function(err, res, body) {
						token_stogu = body.result.token;

						//stoguで、kikurageを削除
						util.delete('/user/kikurage', function(err, res, body) {
							util.assertIsNG(body, APIError.permissionDenied());

							//kikurageが削除されていないことの確認
							util.get('/user/kikurage', function(err, res, body) {
								util.assertIsOK(body);
								util.assertIsUser(body.result, 'kikurage', 'kikurage_name');

								//stoguのtokenが有効であることの確認
								util.get('/auth', function(err, res, body) {
									util.assertIsOK(body);
									util.assertIsUser(body.result.user, 'stogu', 'stogu_name');
									done();
								}, {
									headers: {
										'X-Token': token_stogu
									}
								});
							});
						}, {
							headers: {
								'X-Token': token_stogu
							}
						});
					});
				});
			});
		});
	});
});
