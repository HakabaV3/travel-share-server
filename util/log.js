function logger() {
	var date = new Date(),
		y = date.getFullYear(),
		m = date.getMonth() + 1,
		d = date.getDate(),
		H = date.getHours(),
		M = date.getMinutes(),
		S = date.getSeconds(),
		args = Array.prototype.slice.call(arguments, 0),
		time = ('000' + y).substr(-4) + '/' +
		+('0' + m).substr(-2) + '/' +
		+('0' + d).substr(-2) + ' ' +
		+('0' + H).substr(-2) + ':' +
		+('0' + M).substr(-2) + ':' +
		+('0' + S).substr(-2);

	if (typeof args[0] === 'string') {
		args[0] = time + ' ' + args[0]
	} else if (args[0] instanceof Error) {
		console.log(time + ' Error');
		console.log(args[0].stack);
		return;
	} else {
		args.unshift(time);
	}

	console.log.apply(console, args);
}

process.on('uncaughtException', function(err) {
	logger(err);
});

module.exports = logger;
