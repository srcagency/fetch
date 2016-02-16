'use strict';

var Promise = require('bluebird');
var find = require('array-find');

var addQuery = require('./add-query');
var responses = require('./responses');
var isContentType = require('./is-content-type');
var isAccept = require('./is-accept');
var serialize = require('./serialize');

xhr.response = responses;

var responseMap = {
	1: responses.Error,
	2: responses.Success,
	3: responses.Error,
	4: responses.ClientError,
	5: responses.ServerError,
};

module.exports = xhr;

var withoutBody = [ 'GET', 'DELETE' ];

function xhr( verb, url, query, headers ){
	return new Promise(function( rs, rj ){
		var r = new XMLHttpRequest();

		var isWithoutBody = ~withoutBody.indexOf(verb);

		var contentTypeHeader = headers && find(Object.keys(headers), isContentType);

		var formdata = (window.FormData && query instanceof FormData) || (window.File && query instanceof File);
		var urlencoded = !formdata && contentTypeHeader && headers[contentTypeHeader].indexOf('urlencoded') !== -1;
		var json = !formdata && (contentTypeHeader ? headers[contentTypeHeader].indexOf('json') !== -1 : true);

		if (!headers) {
			headers = {
				accept: 'application/json',
			};
		} else if (!find(Object.keys(headers), isAccept)) {
			headers.accept = 'application/json';
		}

		r.open(verb, isWithoutBody ? addQuery(url, query) : url);

		r.addEventListener('readystatechange', function(){
			if (r.readyState !== 4)
				return;

			var code;
			var message;
			var body;
			var contentType;

			try { code = r.status } catch(e) { code = 0; }
			try { message = r.statusText } catch(e) {}
			try { contentType = r.getResponseHeader('content-type'); } catch(e) {}

			var json = contentType && ~contentType.indexOf('json');

			if (json)
				try { body = JSON.parse(r.responseText); } catch(e) {}
			else
				try { body = r.responseText; } catch(e) {}

			var statusIdentifier = code && (code / 100 | 0);

			var responseType = responseMap[statusIdentifier] || responses.Error;

			var response = new responseType(
				code,
				message || 'Connection trouble',
				null,
				body
			);

			if (statusIdentifier === 2)
				rs(response);
			else
				rj(response);
		});

		Object.keys(headers).forEach(function( key ){
			r.setRequestHeader(key, headers[key]);
		});

		if (!isWithoutBody && query) {
			if (json)
				r.setRequestHeader('Content-Type', 'application/json');

			if (json)
				r.send(JSON.stringify(query))
			else if (formdata)
				r.send(query);
			else if (urlencoded)
				r.send(serialize(query));
			else
				r.send(query);
		} else {
			r.send();
		}
	});
}
