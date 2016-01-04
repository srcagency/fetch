'use strict';

var serialize = require('./serialize');

module.exports = addQuery;

function addQuery( url, data ){
	if (!data)
		return url;

	if (url.indexOf('?') === -1)
		return url+'?'+serialize(data);

	return url+'&'+serialize(data);
}
