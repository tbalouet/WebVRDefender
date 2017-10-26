/*
* Use of this source code is governed by an Apache license that can be
* found in the LICENSE file.
*/
var RoomServer = require('./roomServer.js');
/**
* Class handling server discussion with client
* @param {[type]} rtcServer [description]
*/
function GameServer(ioServer){
  var that = this;
  this.ioServer = ioServer;

  //Master gamestate
  this.rooms = {};
  this.clients = {};

  this.ioServer.on("connection", this.onConnect.bind(this));
}

GameServer.prototype.getGUID = function(){
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
  }
  return s4();
};

GameServer.prototype.onConnect = function(socket){

  //Registering the socket under an ID
  var clientID = this.getGUID();
  while(this.clients[clientID]){
    clientID = this.getGUID();
  }
  this.clients[clientID] = {
    status: "connected",
    socket: socket
  };

  this.registerEvents(clientID);
  this.sendClient(clientID, "onConnect", {clientID : clientID});
  this.log("User " + clientID + " connected");
}

/**
* Registering network calls made by clients
* @return {[type]} [description]
*/
GameServer.prototype.registerEvents = function(clientID){
  this.clients[clientID].socket.on('disconnect', this.onClientDisconnected.bind(this));
  this.clients[clientID].socket.on("clientDisconnected", this.onClientDisconnected.bind(this));
  this.clients[clientID].socket.on("logInRoom", this.onLoginRoom.bind(this));
  this.clients[clientID].socket.on("clientStateUpdated", this.onClientStateUpdated.bind(this));


  //DEFAULT GAME CALLS
  // var onEasyrtcMsg = function(connectionObj, msg, socketCallback, next){
  //   this.gameState[msg.msgData.roomName] = this.gameState[msg.msgData.roomName] || {clients  : {}};
  //   switch(msg.msgType){
  //     case "clientConnect":
  //     case "gameStateUpdated":
  //     this.gameState[msg.msgData.roomName].clients[msg.msgData.clientState.ID] = msg.msgData.clientState;
  //     socketCallback({msgType : "gameState", msgData : {gameState : this.gameState[msg.msgData.roomName]}}); //nice
  //     next(null);
  //     break;
  //   case "getGameState":
  //     socketCallback({msgType : "gameState", msgData : {gameState : this.gameState[msg.msgData.roomName]}}); //nice
  //     next(null);
  //     break;
  //   case "clientDisconnect":
  //     delete this.gameState[msg.msgData.roomName].clients[msg.msgData.clientState.ID];
  //     this.rtcServer.events.emit("gameState", connectionObj, msg, socketCallback, next);
  //     next(null);
  //     break;
  //   default:
  //     this.rtcServer.events.emitDefault("easyrtcMsg", connectionObj, msg, socketCallback, next);
  //     break;
  //   }
  // };
  // this.rtcServer.events.on("easyrtcMsg", onEasyrtcMsg.bind(this));
};

//============SERVER METHODS============//

GameServer.prototype.checkClient = function(clientID){
  return this.clients[clientID] !== undefined;
}

GameServer.prototype.sendClient = function(clientID, eventName, data){
  this.clients[clientID].socket.emit(eventName, data);
}

GameServer.prototype.sendRoom = function(roomName, eventName, data){
  var aRoom = this.rooms[roomName];
  for(var i = 0; i < aRoom.clients.length; ++i){
    this.clients[aRoom.clients[i]].socket.emit(eventName, data);
  }
}

GameServer.prototype.broadcastRoom = function(roomName, clientID, eventName, data){
  var aRoom = this.rooms[roomName];
  for(var i = 0; i < aRoom.clients.length; ++i){
    if(aRoom.clients[i] !== clientID){
      this.clients[aRoom.clients[i]].socket.emit(eventName, data);
    }
  }
}

GameServer.prototype.sendError = function(clientID, error){
  this.clients[clientID].emit("onError", {error: error});
}

//============EVENTS HANDLERS============//

GameServer.prototype.onClientDisconnected = function(data){
  if(data.client && data.client.ID){
    if(this.rooms[data.roomName].hasClient(data.client.ID)){
      this.rooms[data.roomName].removeClient(data.client.ID);
      this.broadcastRoom(data.roomName, data.client.ID, "onGameStateUpdate", this.rooms[data.roomName]);
    }
    console.log("Client "+ data.client.ID +" disconnected");
  }
}

GameServer.prototype.onLoginRoom = function(data){
  if(!this.checkClient(data.client.ID)){
    this.log("Error loginRoom " + data.roomName + ", client " + data.client.ID + " unknown");
    return;
  }

  this.rooms[data.roomName] = this.rooms[data.roomName] || new RoomServer(data.roomName);
  if(this.rooms[data.roomName].hasClient(data.client.ID)){
    var error = "Error, client ID=" + (data.client.ID) + " already logged in Room=" + data.roomName;
    this.log(error);
    this.sendError(data.client.ID, error);
    return;
  }
  else{
    var isMainClient = this.rooms[data.roomName].addClient(data.client);
    this.sendClient(data.client.ID, "onRoomEntered", {isMainClient: isMainClient, gameState: this.rooms[data.roomName]});

    if(!isMainClient){
      this.broadcastRoom(data.roomName, data.client.ID, "onGameStateUpdate", this.rooms[data.roomName]);
    }
  }
}

GameServer.prototype.onClientStateUpdated = function(data){
  if(!this.checkClient(data.client.ID)){
    this.log("Error clientStateUpdate " + data.roomName + ", client " + data.client.ID + " unknown");
    return;
  }

  this.rooms[data.roomName].updateClient(data.client);
  this.broadcastRoom(data.roomName, data.client.ID, "onGameStateUpdate", this.rooms[data.roomName]);
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

module.exports = GameServer;
