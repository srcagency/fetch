'use strict';

var Serializer = require('querystringparser/js/querystringserializer');

module.exports = addQuery;

function addQuery( url, data ){
	if (!data)
		return url;

	if (url.indexOf('?') === -1)
		return url+'?'+serialize(data);

	return url+'&'+serialize(data);
}

function serialize( data ){
	var serializer = new Serializer();

	return serializer.serialize(data);
}
