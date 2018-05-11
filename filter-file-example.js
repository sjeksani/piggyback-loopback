
//The code below replaces only actual javascript files with your compiled javascript code in app.bundle.js

var fs = require('fs');
var filter = function(req, body, res) {
    var outValue = true; 
    if (req.url.indexOf('/etc/designs/kporg/coverage-costs/clientlib-all') != -1 && req.url.indexOf('.js') != -1) {
        console.log('Using local version of MCC application');
        res.statusCode = 200;
        res.end(fs.readFileSync('/Users/sharath.jeksani/Desktop/payment-method/ui.resources/dist/pm/app.bundle.js',{ encoding: 'utf8' }));
    } else {
        outValue = false;
    }
    return outValue;
};
module.exports = filter;
