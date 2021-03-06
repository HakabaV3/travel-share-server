var util = require('util'),
	assert = require('assert'),
	request = require('request');

exports.ENTRY_POINT = 'http://localhost:3000/api/v1';

exports.get = function(uri, callback, opt) {
	request({
		method: 'GET',
		uri: exports.ENTRY_POINT + uri,
		json: true,
		headers: opt ? opt.headers : undefined
	}, callback);
};

exports.post = function(uri, body, callback, opt) {
	request({
		method: 'POST',
		uri: exports.ENTRY_POINT + uri,
		json: body,
		headers: opt ? opt.headers : undefined
	}, callback);
};

exports.patch = function(uri, body, callback, opt) {
	request({
		method: 'PATCH',
		uri: exports.ENTRY_POINT + uri,
		json: body,
		headers: opt ? opt.headers : undefined
	}, callback);
};

exports.delete = function(uri, callback, opt) {
	request({
		method: 'DELETE',
		uri: exports.ENTRY_POINT + uri,
		json: true,
		headers: opt ? opt.headers : undefined
	}, callback);
};

exports.assert = assert;

exports.assertIsOK = function(object) {
	assert.equal(object.status, 'OK', '"OK" -> \n\n' + util.inspect(object));
	assert.deepEqual(Object.keys(object).sort(), ['result', 'status'].sort());
};

exports.assertIsNG = function(object, err) {
	assert.equal(object.status, 'NG', '"NG" -> \n\n' + util.inspect(object));
	assert.deepEqual(Object.keys(object).sort(), ['result', 'status'].sort());
	if (err) assert.deepEqual(object.result, err);
};

exports.assertIsUserObject = function(object, userId, name) {
	assert.deepEqual(Object.keys(object).sort(), ['id', 'created', 'updated', 'userId', 'name'].sort());
	if (userId) assert.equal(object.userId, userId);
	if (name) assert.equal(object.name, name);
};

exports.assertIsTravelObject = function(object, name) {
	assert.deepEqual(Object.keys(object).sort(), ['id', 'created', 'updated', 'name', 'members', 'places'].sort());
	if (name) assert.equal(object.name, name);
};

exports.assertIsAuthObject = function(object, userId, name) {
	assert.deepEqual(Object.keys(object).sort(), ['id', 'created', 'updated', 'user', 'token'].sort());
	exports.assertIsUserObject(object.user, userId, name);
};

exports.assertIsEmpty = function(object) {
	exports.assertIsOK(object);
	assert.deepEqual(object.result, {});
};

exports.assertIsUser = function(object, userId, name) {
	exports.assertIsOK(object);
	exports.assertIsUserObject(object.result, userId, name)
};

exports.assertIsTravel = function(object, name) {
	exports.assertIsOK(object);
	exports.assertIsTravelObject(object.result, name)
};

exports.assertIsTravels = function(object, name) {
	exports.assertIsOK(object);
	object.result.forEach(function(travelObj) {
		exports.assertIsTravelObject(travelObj);
	});
};

exports.assertIsAuth = function(object, userId, name) {
	exports.assertIsOK(object);
	exports.assertIsAuthObject(object.result, userId, name)
};
