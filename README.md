# piggyback-loopback

sudo npm run piggyback-loopback
sudo npm run piggyback-loopback TARGET_IP=
sudo npm run piggyback-loopback TARGET_IP= "OUTPUT_DIR="

(FILTER_FILE too)

How to Use

1) ping the destination, record the specific IP address

2) change the '/etc/hosts' file mapping hostname to IP address '127.0.0.1'

3) change the 'reqOptions.hostname' assigned value in 'piggyback-loopback.js' to the value recorded earlier
4) start the piggyback-loopback server
5) open a browser in incognito mode, open a second tab, go to a valid URL location at the hostname, accept the certificate (so that this certificate will be considered by the browser in the standard case)
6) use the web site in the other (original) browser tab
7) stop the server and undo previous edit to '/etc/hosts'



Using Local Copy of Application While Using the Application on an Environment Like Dev3 or Dev20:


Skip to end of metadata


Go to start of metadata

The following instructions for using a locally-compiled version of the MCC (Nov release) application while your local browser is accessing a non-local environment (like Dev3) are from an email entitled 'MCC Project - Draft instructions for using local copy of application while using the application on an environment like Dev3' by Gary Steinmetz sent on September 27, 2017.
 
(What is this?)
This email documents draft instructions for using a locally-compiled version of the MCC (Nov release) application while your local browser is accessing a non-local environment (like Dev3).
(Why should I care?)
Maybe you shouldn't, but this technique allows you to use your local code (with log statements preserved) while using a non-local version of the application (like Dev3). This gives you a much better setup for (A) troubleshooting problems on a non-local environment and (B) having much greater confidence what changes you make locally will work the same on the target environment (like Dev3). For instance, this methodology should allow you to troubleshoot/remediate a Production problem without having to deploy the remediation to Production. 
(How's it done?)
The (sadly lengthy) draft instructions are listed below.

 1) Open a command prompt and download the MCC project
  - git clone -b release/november-2017 https://bitbucket-fof.appl.kp.org/scm/kpweb/coverage-costs.git
  
 2) Go to the MMC project another directory - cd coverage-costs/ui.resources
 
 3) Make whatever changes you'd like that will appear on the Dev3 MCC page (like diagnostic log statements, you can repeat this and the below steps later if you want to make additional changes)
 4) In the 'package.json' file, remove the 'cross-env STRIP_CONSOLE_LOG=true ' part of the 'build:mccAem' command (this will ensure that log statements are stripped)
 5) Download the MCC project libraries with this command - npm install
 6) Create the JavaScript project file with this command - npm run build:mccAem
 7) The JavaScript project file will be created at 'dist/mcc/app.bundle.js', record the full directory path of this file (like '/Users/garysteinmetz/Desktop/temp1/coverage-costs/ui.resources/dist/mcc/app.bundle.js', this string will be used below but use the value you recorded instead)
 8) Record the URL path of the deployed MCC application (JavaScript file) on Dev3 by logging into Dev3 MCC with Chrome developer tools on, then looking under the 'Network' tab for the JavaScript entry with 'coverage-costs' in its path, record the path part (from '/etc' onward) of this entry, here's the entry that I recorded but it will vary
  - https://wppdev3.kaiserpermanente.org/etc/designs/kporg/coverage-costs/clientlib-all.3c3962b85f19e15697a6d0bc271bcb30.js
 9) Get the IP address of 'wppdev3.kaiserpermanente.org' by using the following command - ping wppdev3.kaiserpermanente.org
10) Record the IP address listed in the last statement ('172.20.210.160' will be used below but use the value you recorded instead)
11) Add the following entry to the local '/etc/hosts' file (for instance, run 'sudo vi /etc/hosts') - 127.0.0.1 wppdev3.kaiserpermanente.org
12) Open a command prompt and download the Piggyback-Loopback project
  - git clone https://github.com/garysteinmetz/piggyback-loopback.git
13) Go to the Piggyback-Loopback project directory - cd piggyback-loopback
14) Download the Piggyback-Loopback project libraries with this command - npm install
15) Replace the contents of the './filter-file-example.js' file in the project with the following content -
  //
var fs = require('fs');
var filter = function(req, body, res) {
    var outValue = true; 
    if (req.url.indexOf('/etc/designs/kporg/coverage-costs/clientlib-all') != -1 && req.url.indexOf('.js') != -1) {
        console.log('Using local version of MCC application');
        res.statusCode = 200;
        res.end(fs.readFileSync('/Users/garysteinmetz/Desktop/temp1/coverage-costs/ui.resources/dist/mcc/app.bundle.js',{ encoding: 'utf8' }));
    } else {
        outValue = false;
    }
    return outValue;
};
module.exports = filter;
  //
16) The command in the next step writes output to the './temp1' directory, make sure this directory doesn't already exist because the command will fail otherwise
17) Start the Piggyback-Loopback application with the following command - sudo npm run piggyback-loopback TARGET_IP=172.20.210.160 FILTER_FILE=./filter-file-example.js OUTPUT_DIR=./temp1
18) Go to https://wppdev3.kaiserpermanente.org/georgia/secure/coverage-costs and accept the certificate (it's generated locally by Piggyback-Loopback and therefore not valid) and then login, notice how your local application (not the one on Dev3) is being used instead (but everything else about the Dev3 MCC page, like CSS and web services and other JS files, is still the same), even though the Dev3 MCC application is being used
19) Cleanup - Turn off the Piggyback-Loopback server, remove or comment out the entry in the '/etc/hosts' file for 'wppdev3.kaiserpermanente.org'
