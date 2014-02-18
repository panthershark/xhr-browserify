var http = require('http');
var jsonpCallbacks = {};
var url = require('url');

var jsonp = function(uri, done) {
  var id;
  var fn;

  // get an unused id.
  do {
    id = 'jsonp_xhr_' + Math.round(Math.random() * 65000);
  }
  while(jsonpCallbacks[id]);

  // assign a callback that forward to original handler.
  jsonpCallbacks[id] = window[id] = function(data) {
    delete jsonpCallbacks[id]; // remove this since it was called.
    done(data);
  };

  // append jsonp callback to url
  delete uri.search;
  uri.query = uri.query || {};
  uri.query.callback = id;

  // append callback
  var script = document.createElement('script');
  var head = document.getElementsByTagName('head')[0];
  script.src = url.format(uri);
  head.appendChild(script);

  // setup callback to handle the response.
  window[id] = function(data) {
    done(null, data);
    head.removeChild(script);
  };

  return jsonpCallbacks[id];
};

var xhr = function(uri, done) {
  http.get(uri, function (res) {
    var buf = '';

    res.on('data', function (data) {
      buf += data;
    });

    res.on('end', function () {
      done(buf);
    });
  });
};

var json = function(uri, done) {
  xhr(uri, function (buf) {
    done(JSON.parse(buf));
  });
};

module.exports = function(uri, options, callback) {
  if (typeof(options) == 'function') {
    callback = options;
    options = {
      json: true
    };
  } else if (typeof(options) == 'object') {
    if (typeof(options.json) == 'undefined') {
      options.json = true;
    }
  }

  if (typeof(uri) === 'string') {
    uri = url.parse(uri);
  }

  if (options.jsonp) {
    jsonp(uri, callback);
  }
  if (options.json) {
    json(uri, callback);
  }
  else {
    xhr(uri, callback);
  }
};


