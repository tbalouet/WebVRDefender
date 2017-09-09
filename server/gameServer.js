/*
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file.
 */
/**
 * Class handling server discussion with client
 * @param {[type]} rtcServer [description]
 */
function GameServer(rtcServer){
  var that = this;
  this.rtcServer = rtcServer;

  //Master gamestate
  this.gameState = {
    clients  : {}
  }

  this.registerEvents();
}

/**
 * Special log to append the Class name beforehand
 * @param  {...[type]} params [description]
 * @return {[type]}           [description]
 */
GameServer.prototype.log = function(...params){
  let args = ["[==GAMESERVER==]"].concat(params);
  console.log.apply(console, args);
};

/**
 * Registering network calls made by clients
 * @return {[type]} [description]
 */
GameServer.prototype.registerEvents = function(){
  //DEFAULT GAME CALLS
  var onEasyrtcMsg = function(connectionObj, msg, socketCallback, next){
      switch(msg.msgType){
          case "clientConnect":
          case "gameStateUpdated":
            this.gameState.clients[msg.msgData.clientState.ID] = msg.msgData.clientState;
            socketCallback({msgType : "gameState", msgData : {gameState : this.gameState}}); //nice
            next(null);
            break;
          case "clientDisconnect":
            delete this.gameState.clients[msg.msgData.clientState.ID];
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

module.exports = GameServer;