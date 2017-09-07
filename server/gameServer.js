/*
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file.
 */

function GameServer(rtcServer){
  this.rtcServer = rtcServer;

  this.registerEvents();
}

GameServer.prototype.log = function(...params){
  let args = ["[==GAMESERVER==]"].concat(params);
  console.log.apply(console, args);
};

GameServer.prototype.registerEvents = function(){
  // Overriding the default easyrtcAuth listener, only so we can directly access its callback
  this.rtcServer.events.on("easyrtcAuth", this.onEasyRTCAuth.bind(this));

  // To test, lets print the credential to the console for every room join!
  this.rtcServer.events.on("roomCreate", this.onRoomCreate.bind(this));

  this.rtcServer.events.on("roomJoin", this.onRoomJoin.bind(this));
};

GameServer.prototype.onEasyRTCAuth = function(socket, easyrtcid, msg, socketCallback, callback) {
  this.rtcServer.events.defaultListeners.easyrtcAuth(socket, easyrtcid, msg, socketCallback, function(err, connectionObj){
    if (err || !msg.msgData || !msg.msgData.credential || !connectionObj) {
        callback(err, connectionObj);
        return;
    }

    connectionObj.setField("credential", msg.msgData.credential, {"isShared":false});

    this.log("["+easyrtcid+"] Credential saved!", connectionObj.getFieldValueSync("credential"));

    callback(err, connectionObj);
  });
};

GameServer.prototype.onRoomCreate = function(appObj, creatorConnectionObj, roomName, roomOptions, callback) {
  this.log("roomCreate fired! Trying to create: " + roomName);

  appObj.events.defaultListeners.roomCreate(appObj, creatorConnectionObj, roomName, roomOptions, callback);
};

GameServer.prototype.onRoomJoin = function(connectionObj, roomName, roomParameter, callback) {
  this.log("["+connectionObj.getEasyrtcid()+"] Credential retrieved!", connectionObj.getFieldValueSync("credential"));
  this.rtcServer.events.defaultListeners.roomJoin(connectionObj, roomName, roomParameter, callback);

  console.log("MEEEESSSAAAAGGGGEEEEE");
  connectionObj.socket.send("tartelette")
};

module.exports = GameServer;