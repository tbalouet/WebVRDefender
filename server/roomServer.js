/*
* Use of this source code is governed by an Apache license that can be
* found in the LICENSE file.
*/
/**
* Class handling game rooms
* @param {[type]} rtcServer [description]
*/
function RoomServer(roomName){
  this.name = roomName;

  this.mainClient = undefined;
  this.clients = {};
  this.nbClients = 0;
}

RoomServer.prototype.hasClient = function(clientID){
  return this.clients[clientID] !== undefined;
};

/**
 * Add a client to the room
 * returns true if client is main (first to enter)
 * @param {[type]} clientID [description]
 */
RoomServer.prototype.addClient = function(client){
  this.clients[client.ID] = client;

  ++this.nbClients;
  if(this.nbClients === 1){
    this.mainClient = client.ID;
    return true;
  }
  return false;
};

RoomServer.prototype.removeClient = function(clientID){
  delete this.clients[clientID];
}

RoomServer.prototype.updateClient = function(client){
  this.clients[client.ID] = client;
}

module.exports = RoomServer;
