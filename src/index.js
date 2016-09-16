'use strict';

var Promise = require('bluebird');
var request = require('request');
var find = require('array-find');
var isStream = require('is-stream');

var addQuery = require('./add-query');
var responses = require('./responses');
var isContentType = require('./is-content-type');
var isAccept = require('./is-accept');
var serialize = require('./serialize');

xhr.response = responses;
xhr.serialize = serialize;

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

	var contentTypeHeader = headers && find(Object.keys(headers), isContentType);

	var streaming = isStream(query);

	var urlencoded = contentTypeHeader && headers[contentTypeHeader].indexOf('urlencoded') !== -1;
	var json = contentTypeHeader ? headers[contentTypeHeader].indexOf('json') !== -1 : true;

	if (!headers) {
		headers = {
			accept: 'application/json',
		};
	} else if (!find(Object.keys(headers), isAccept)) {
		headers.accept = 'application/json';
	}

	var resolve;
	var reject;

	var promise = new Promise(function( rs, rj ){
		resolve = rs;
		reject = rj;
	});

	var r = request({
		method: verb,
		url: isWithoutBody ? addQuery(url, query) : url,
		headers: headers,
		body: !isWithoutBody && !streaming && ((json && query) || (urlencoded && serialize(query)) || query) || undefined,
		gzip: true,
		json: json,
	}, function( err, response ){
		if (err)
			reject(err);
		else
			resolve(response);
	});

	if (streaming)
		query.pipe(r);

	return promise
		.then(function( httpResponse ){
			var code = httpResponse.statusCode;
			var statusIdentifier = code && (code / 100 | 0);

			var responseType = responseMap[statusIdentifier] || responses.Error;
			var respondJSON = httpResponse.headers['content-type'] && httpResponse.headers['content-type'].indexOf('json') !== -1;

			var response = new responseType(
				code,
				httpResponse.statusMessage || 'Connection trouble',
				httpResponse.headers,
				!json && respondJSON ? JSON.parse(httpResponse.body) : httpResponse.body
			);

			if (statusIdentifier === 2)
				return response;

			throw response;
		});
}
