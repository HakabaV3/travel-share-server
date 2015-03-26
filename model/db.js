var mongoose = require('mongoose');

var DB_HOST = 'localhost',
	DB_PORT = process.env.DB_PORT || 27017,
	DB_NAME = 'travel-share',
	DB_URL = 'mongodb://' + DB_HOST + ':' + DB_PORT + '/' + DB_NAME;

mongoose.connect(DB_URL);

module.exports = mongoose;
