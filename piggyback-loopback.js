//console.log("What's up?");
var https = require('https');
var pem = require('pem');
var fs = require('fs');
var path = require('path');
//var JsonCircular = require('json-circular');

var targetIp;
var filterFile;
var outputDir;
var filter;

for (var i = 0; i < process.argv.length; i++) {
  var nextArg = process.argv[i];
  //console.log('nextArg = ' + nextArg);
  if (nextArg.startsWith('TARGET_IP=')) {
    targetIp = nextArg.substring(('TARGET_IP=').length);
    console.log('Target IP Address - ' + targetIp);
  } else if (nextArg.startsWith('FILTER_FILE=')) {
    filterFile = nextArg.substring(('FILTER_FILE=').length);
    console.log('Loading call filtering file at ' + filterFile);
    filter = require(filterFile);
    if (typeof filter !== 'function') {
      throw "Filter file must declare function 'filter', but it didn't";
    }
  } else if (nextArg.startsWith('OUTPUT_DIR=')) {
    outputDir = nextArg.substring(('OUTPUT_DIR=').length);
    console.log('Output Directory - ' + outputDir);
  }
}

if (!targetIp) {
  throw "No 'TARGET_IP' parameter was defined";
}

if (outputDir != null && fs.existsSync(outputDir)) {
  throw ('Output directory already exists, but only its parent directory should');
} else if (outputDir != null && !fs.existsSync(path.join(outputDir, '..'))) {
  throw ('The parent directory of the output directory does not exist, but it should');
} else {
  fs.mkdirSync(outputDir);
}

var callCount = 0;

//console.log(process.argv);

var processIncomingRequest = function(req, res) {
  var filePrefix = "" + (++callCount);
  while (filePrefix.length < 5) {
    filePrefix = "0" + filePrefix;
  }
  filePrefix += "_" + req.method + "_" + req.url;
  filePrefix = filePrefix.replace(/[^a-z0-9]/gmi, "_");
  if (filePrefix.length > 230) {
    filePrefix = filePrefix.substring(0, 230);
  }
  var requestMetadata = "";
  //https://stackoverflow.com/questions/17251553/node-js-request-object-documentation
  var headers = req.headers;
  var method = req.method;
  var url = req.url;
  var body = [];
  req.on('data', function(chunk) {
    body.push(chunk);
  });
  req.on('end', function() {
    //console.log('filter = ' + filter);
    var filterCalled = (typeof filter === 'function') && filter(req, body, res);
    if (!filterCalled) {
      var reqOptions= {};
      reqOptions.hostname = targetIp;
      reqOptions.method = method;
      reqOptions.post = 443;
      reqOptions.path = url;
      reqOptions.headers = {};
      reqOptions.rejectUnauthorized = false;
      //
      requestMetadata += "\nHostname - " + req.hostname;
      requestMetadata += "\nIP Address - " + targetIp;
      requestMetadata += "\nPort - " + req.port;
      requestMetadata += "\nPath - " + url;
      requestMetadata += "\n\n(HEADERS)\n\n";
      //
      for (var nextHeader in headers) {
        reqOptions.headers[nextHeader] = headers[nextHeader];
        //
        requestMetadata += nextHeader + ": " + headers[nextHeader] + "\n";
      }
      fs.writeFileSync(
        path.join(outputDir, filePrefix + ".request.metadata.txt"), requestMetadata);
      //
      //console.log('[' + url + ', METHOD = ' + method + ', BODY_LENGTH = ' + body.length + ']');
      var innerRequest = https.request(
        reqOptions,
        function(innerResponse) {
          res.statusCode = innerResponse.statusCode;
          //
          for (var nextHeader in innerResponse.headers) {
            //console.log('res = ' + res);
            //console.log('innerResponse = ' + innerResponse);
            //console.log('res.headers = ' + res.headers);
            //console.log('innerResponse.headers = ' + innerResponse.headers);
            //console.log('nextHeader = ' + nextHeader);
            //console.log('  [' + nextHeader + '] = ' + innerResponse.headers[nextHeader]);
            res.setHeader(nextHeader, innerResponse.headers[nextHeader]);
            //console.log('AfterSetHeader');
          }
          //console.log('STATUS = ' + innerResponse.statusCode);
          var innerResponseBody = [];
          innerResponse.on('data', function(chunk) {
            innerResponseBody.push(chunk);
          });
          innerResponse.on('end', function() {
            //console.log('<RESPONSE_BODY_START>');
            //console.log(innerResponseBody);
            res.end(Buffer.concat(innerResponseBody));
            //console.log('</RESPONSE_BODY_START>');
          });
        });
      innerRequest.end(Buffer.concat(body));
    }
    //console.log('body: ' + body);
    //var jsonObj = JSON.parse(body);
    //console.log(jsonObj.$key);
  });
  //console.log(Object.keys(req));
  //console.log('req.url = ' + req.url);
  //console.log('req.method = ' + req.method);
  //console.log('req.headers = ' + JSON.stringify(req.headers));
  //console.log('req.read = ' + req.read);
  //console.log(Object.keys(req.connection));
  //console.log('req.connection.read = ' + req.connection.read);
  //console.log('req.on = ' + req.on);
};

pem.createCertificate(
  {days:1, selfSigned:true},
  function(err, keys) {
    https.createServer(
      {key: keys.serviceKey, cert: keys.certificate},
      function(req, res) {
        processIncomingRequest(req, res);
      }
    ).listen(443);
  });
