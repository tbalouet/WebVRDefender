// Use of this source code is governed by an Apache license that can be
// found in the LICENSE file.
// Load required modules
var express    = require("express");           // web framework external module
var app        = express();
var http       = require("http").Server(app);              // http server core module
var io         = require("socket.io")(http);        // web socket external module
var conf       = require('./config');
var GameServer = require('./server/gameServer.js');


// Setup and configure Express http server. Expect a subfolder called "static" to be the web root.
app.set("views", ["views"]);
app.use('/public/', express.static(__dirname + '/public', {maxAge : conf.maxAge}));
app.use(express.static(__dirname + '/public', {maxAge : conf.maxAge}));

var gameServer = new GameServer(io);

/*=============HomePage=============*/
app.get('/', function(req, res){
  if(req.get("X-Forwarded-Proto") === "http"){
    res.redirect("https://" + req.headers['host'] + req.url);
    return;
  }
  res.render('index.ejs', {aFrameFile : conf.aFrameFile});
});

//listen on port
http.listen(conf.port, function () {
    console.log('listening on http://localhost:' + conf.port);
});
