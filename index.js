var http = require('http');
var jsonpCallbacks = {};
var url = require('url');

var jsonp = function (uri, done) {
  var id;
  var fn;

  // get an unused id.
  do {
    id = 'jsonp_xhr_' + Math.round(Math.random() * 65000);
  }
  while (jsonpCallbacks[id]);

  // assign a callback that forward to original handler.
  jsonpCallbacks[id] = window[id] = function (data) {
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
  window[id] = function (data) {
    head.removeChild(script); // remove the script block from DOM.
    delete window[id]; // remove this closure
    done(null, data); // send back data.
  };

  return jsonpCallbacks[id];
};

var xhr = function (uri, done) {
  http.get(uri, function (res) {
    var buf = [];

    res.on('data', function (chunk) {
      buf.push(chunk);
    });

    res.on('end', function () {
      var data = buf.join('');

      try {
        data = JSON.parse(data);
      } catch (e) {}

      done(null, data);
    });
  });
};

module.exports = function (uri, options, callback) {
  if (typeof (options) == 'function') {
    callback = options;
    options = {};
  }

  if (typeof (uri) === 'string') {
    uri = url.parse(uri);
  }

  if (options.jsonp && typeof (window) != 'undefined') {
    jsonp(uri, callback);
  } else {
    xhr(uri, callback);
  }
};