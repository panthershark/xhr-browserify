xhr-browserify
==============

Browserify compatible xhr module with support for jsonp

Simple case, in domain request.

```
var xhr = require('xhr-browserify');

xhr('/path/to/api?dogs=paws', function(err, data) {
  console.log(data);
});

```

JSONP

```
var xhr = require('xhr-browserify');
var uri = require('url').parse('http://www.foo.com/path/to/api?dogs=paws')

xhr(uri, { jsonp: true }, function(err, data) {
  console.log(data);
});

```

## Options

* *jsonp*: if true, then a callback is sent to the server and the output is parsed.  default: false

