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
