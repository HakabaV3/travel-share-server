function APIError(param) {
	this.code = param.code || APIError.Code.UNKNOWN;
	this.httpCode = param.httpCode || APIError.HTTPCode.INTERNAL_SERVER_ERROR;
	this.type = getTypefromCode(this.code);
	this.detail = param.detail || {};
}

APIError.Code = {
	NOT_FOUND: 1,
	PERMISSION_DENIED: 2,
	INVALID_PARAMETER: 3,
	ALREADY_CREATED: 4,
	MUST_AUTHORIZED: 5,
	UNKNOWN: 999
};

APIError.HTTPCode = {
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	PAYMENT_REQUIRED: 402,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	METHOD_NOT_ALLOWED: 405,
	NOT_ACCEPTABLE: 406,
	PROXY_AUTHENTICATION_REQUIRED: 407,
	REQUEST_TIMEOUT: 408,
	CONFLICT: 409,
	GONE: 410,
	LENGTH_REQUIRED: 411,
	PRECONDITION_FAILED: 412,
	REQUEST_ENTITY_TOO_LARGE: 413,
	REQUEST_URL_TOO_LARGE: 414,
	UNSUPPORTED_MEDIA_TYPE: 415,
	INTERNAL_SERVER_ERROR: 500,
	NOT_IMPLEMENTED: 501,
	BAD_GATEWAY: 502,
	SERVICE_UNAVAILABLE: 503,
	GATEWAY_TIME_OUT: 504,
	HTTP_VERSION_NOT_SUPPORTED: 505
}

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
		httpCode: APIError.HTTPCode.NOT_FOUND,
		detail: detail
	});
};

APIError.mustAuthorized = function(detail) {
	return new APIError({
		code: APIError.Code.MUST_AUTHORIZED,
		httpCode: APIError.HTTPCode.UNAUTHORIZED,
		detail: detail
	});
};

APIError.permissionDenied = function(detail) {
	return new APIError({
		code: APIError.Code.PERMISSION_DENIED,
		httpCode: APIError.HTTPCode.FORBIDDEN,
		detail: detail
	});
};

APIError.invalidParameter = function(detail) {
	return new APIError({
		code: APIError.Code.INVALID_PARAMETER,
		httpCode: APIError.HTTPCode.BAD_REQUEST,
		detail: detail
	});
};

APIError.alreadyCreated = function(detail) {
	return new APIError({
		code: APIError.Code.ALREADY_CREATED,
		httpCode: APIError.HTTPCode.CONFLICT,
		detail: detail
	});
};

APIError.unknown = function(detail) {
	return new APIError({
		code: APIError.Code.UNKNOWN,
		httpCode: APIError.HTTPCode.INTERNAL_SERVER_ERROR,
		detail: detail
	});
};

module.exports = APIError;
