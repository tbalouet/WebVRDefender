// Use of this source code is governed by an Apache license that can be
// found in the LICENSE file.
// Load required modules
var http        = require("http");              // http server core module
var express     = require("express");           // web framework external module
var socketIo    = require("socket.io");        // web socket external module
var easyrtc     = require("easyrtc");               // EasyRTC external module
var conf        = require('./config');
var GameServer  = require('./server/gameServer.js');

// Set process name
process.title = "node-easyrtc";

// Setup and configure Express http server. Expect a subfolder called "static" to be the web root.
var app = express();
app.set("views", ["views"]);
app.use('/public/', express.static(__dirname + '/public', {maxAge : conf.maxAge}));
app.use(express.static(__dirname + '/public', {maxAge : conf.maxAge}));

// Start Express http server
var webServer = http.createServer(app).listen(conf.port);

// Start Socket.io so it attaches itself to Express server
var socketServer = socketIo.listen(webServer, {"log level":1});

var myIceServers = [
  {"url":"stun:stun.l.google.com:19302"},
  {"url":"stun:stun1.l.google.com:19302"},
  {"url":"stun:stun2.l.google.com:19302"},
  {"url":"stun:stun3.l.google.com:19302"}
];
easyrtc.setOption("appIceServers", myIceServers);
easyrtc.setOption("logLevel", "warning");
easyrtc.setOption("demosEnable", false);

var gameServer = new GameServer(easyrtc);

// Start EasyRTC server
var rtc = easyrtc.listen(app, socketServer, null, function(err, rtcRef) {
    console.log("===== Initiated =====");
});

/*=============HomePage=============*/
app.get('/', function(req, res){
  if(req.get("X-Forwarded-Proto") === "http"){
    res.redirect("https://" + req.headers['host'] + req.url);
    return;
  }
  res.render('index.ejs', {aFrameFile : conf.aFrameFile});
});

//listen on port
webServer.listen(conf.port, function () {
    console.log('listening on http://localhost:' + conf.port);
});
