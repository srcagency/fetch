'use strict';

var Serializer = require('querystringparser/js/querystringserializer');

module.exports = serialize;

function serialize( data ){
	var serializer = new Serializer();

	return serializer.serialize(data);
}
