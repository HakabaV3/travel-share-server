function APIError(param) {
	this.code = param.code || APIError.Code.UNKNOWN;
	this.type = getTypefromCode(this.code);
	this.detail = param.detail || {};
}

APIError.Code = {
	NOT_FOUND: 1,
	PERMISSION_DENIED: 2,
	INVALID_PARAMETER: 3,
	ALREADY_CREATED: 4,
	UNKNOWN: 999
};


function getTypefromCode(code) {
	var codes = APIError.Code,
		keys = Object.keys(APIError.Code),
		i, max;


	for (i = 0, max = keys.length; i < max; i++) {
		if (codes[keys[i]] === code) {
			return keys[i];
		}
	}

	return 'UNKNOWN';
}

APIError.notFound = function(detail) {
	return new APIError({
		code: APIError.Code.NOT_FOUND,
		detail: detail
	});
};

APIError.permissionDenied = function(detail) {
	return new APIError({
		code: APIError.Code.PERMISSION_DENIED,
		detail: detail
	});
};

APIError.invalidParameter = function(detail) {
	return new APIError({
		code: APIError.Code.INVALID_PARAMETER,
		detail: detail
	});
};

APIError.alreadyCreated = function(detail) {
	return new APIError({
		code: APIError.Code.ALREADY_CREATED,
		detail: detail
	});
};

APIError.unknown = function(detail) {
	return new APIError({
		code: APIError.Code.UNKNOWN,
		detail: detail
	});
};

module.exports = APIError;
