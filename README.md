# Fetch one

Very opinionated one-function package for doing HTTP requests from Node.js
(using [request](https://www.npmjs.com/package/request)) and the browser if
you're using something compatible with
[Browserify](https://www.npmjs.com/package/browserify).

Returning (bluebird) promises resolving to a response object (read source for
details) having `code`, `mesage`, `headers` and `body` properties. If the code
is not in the 200 range, the response will be thrown instead.

```js
var fetch = require('fetch-one');

fetch('GET', 'https://google.com', { q: 'peace' }, {
	'X-Progress': 'Half way there'
});

fetch('POST', 'http://example', {
	field: 'value',
	nested: {
		field: 'value',
	},
})
```

I just needed something simple that worked in both environments and without a
lot of bells and whistles. It is probably inadequate for most other use cases
than mine.

I hope it will some day be replaced by a "universal" version of the new fetch
API.
