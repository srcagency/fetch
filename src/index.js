'use strict';

var Promise = require('bluebird');
var request = Promise.promisify(require('request'));

var addQuery = require('./add-query');
var responses = require('./responses');

xhr.response = responses;

var responseMap = {
	1: responses.Error,
	2: responses.Success,
	3: responses.Error,
	4: responses.ClientError,
	5: responses.ServerError,
};

var withoutBody = [ 'GET', 'DELETE' ];

module.exports = xhr;

function xhr( verb, url, query, headers ){
	var isWithoutBody = ~withoutBody.indexOf(verb);

	return request({
		method: verb,
		url: isWithoutBody ? addQuery(url, query) : url,
		headers: headers,
		body: !isWithoutBody && query,
		gzip: true,
		json: true,
	})
		.then(function( httpResponse ){
			var code = httpResponse.statusCode;
			var statusIdentifier = code && (code / 100 | 0);

			var responseType = responseMap[statusIdentifier] || responses.Error;

			var response = new responseType(
				code,
				httpResponse.statusMessage || 'Connection trouble',
				httpResponse.headers,
				httpResponse.body
			);

			if (statusIdentifier === 2)
				return response;

			throw response;
		});
}
