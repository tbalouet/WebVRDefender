/*
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file.
 */
function GameServer(rtcServer){
  var that = this;
  this.rtcServer = rtcServer;


  this.gameState = {
    clients  : {}
  }

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

  //DEFAULT GAME CALLS
  var onEasyrtcMsg = function(connectionObj, msg, socketCallback, next){
      switch(msg.msgType){
          case "clientConnect":
            this.gameState.clients[msg.msgData.clientState.ID] = msg.msgData.clientState;
            socketCallback({msgType : "gameState", msgData : {gameState : this.gameState}}); //nice
            next(null);
            break;
          case "clientDisconnect":
            delete this.gameState.clients[msg.msgData.clientID];
            socketCallback({msgType : "gameState", msgData : {gameState : this.gameState}}); //nice
            next(null);
            break;
          case "gameStateUpdated":
            this.gameState.clients[msg.msgData.clientState.ID] = msg.msgData.clientState;
            socketCallback({msgType : "gameState", msgData : {gameState : this.gameState}}); //nice
            next(null);
            break;
          default:
              this.rtcServer.events.emitDefault("easyrtcMsg", connectionObj, msg, socketCallback, next);
              break;
      }
  };
  this.rtcServer.events.on("easyrtcMsg", onEasyrtcMsg.bind(this));
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
};

module.exports = GameServer;