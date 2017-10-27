/* global AFRAME, NAF */
// Use of this source code is governed by an Apache license that can be
// found in the LICENSE file.
(function(){
  "use strict";

  /**
  * Handle discussions with the server and Game State
  * @return {[type]}                   [description]
  */
  AFRAME.registerComponent("wvrtd-game-client", {
    init: function() {
      //General game state with informations about all clients
      this.gameState = undefined;
      this.serverConnected = false;
      this.mainClient = false;

      this.clientState = {
        ID     : 0,
        type   : undefined
      };
    },
    setDevice: function(deviceType){
      this.clientState.type = deviceType;
      this.initPlayer();
    },
    /**
    * Init the client, called when connected to the server
    * @return {[type]} [description]
    */
    initClient : function(params){
      this.roomName = params.roomName;
      this.socket = io();

      this.registerEvents();
    },
    broadcastToRoom: function(evtName){
      this.socket.emit("broadcastToRoom", {roomName : this.roomName, client: this.clientState, evtName: evtName});
    },
    registerEvents: function(){
      window.onbeforeunload = this.onDisconnect.bind(this);

      this.socket.on("onConnect", this.onConnect.bind(this));
      this.socket.on("onError", this.onError.bind(this));
      this.socket.on("onRoomEntered", this.onRoomEntered.bind(this));
      this.socket.on("onGameStateUpdate", this.onGameStateUpdate.bind(this));
    },
    onConnect: function(data){
      console.log("Client connected with ID="+data.clientID);
      this.clientState.ID = data.clientID;
      this.socket.emit("logInRoom", {roomName : this.roomName, client: this.clientState});
    },
    /**
    * Event called on window.onbeforeunload when client disconnects
    * @return {[type]} [description]
    */
    onDisconnect : function(){
      this.socket.emit("clientDisconnected", {roomName : this.roomName, clientID: this.clientState.ID});
    },
    onError: function(data){
      console.log("[SERVER ERROR]", data.error);
    },
    onRoomEntered: function(data){
      this.mainClient = data.isMainClient;
      this.gameState = data.gameState;
      console.log("Client " + this.clientState.ID + " entered room " + data.gameState.name + (this.mainClient ? " and is Main client" : ""));
      this.initialSetup();
    },
    onGameStateUpdate: function(data){
      this.gameState = data;
      console.log("[WVRTD-Game-Client]", "Gamestate received", this.gameState);
      if(!document.querySelector("#playersListCard").classList.contains("hide")){
        WVRTD.gameLaunchUI.updatePlayerList(this.gameState);
      }
    },
    /**
    * Send game state to server when updated
    * @return {[type]} [description]
    */
    sendClientStateToServer : function(){
      this.socket.emit("clientStateUpdated", {roomName : this.roomName, client: this.clientState});
    },
    /**
    * Init player entity by checking its type
    * @return {[type]} [description]
    */
    initialSetup : function(){
      if(!this.mainClient){
        //Otherwise, he'll be looking for enemy entities to be created
        document.body.addEventListener('entityCreated', this.onNAFEntityCreated.bind(this));
        WVRTD.gameLaunchUI.removeLaunchGame();
        this.socket.on("onGameLaunched", this.onGameLaunched.bind(this));
        this.socket.on("onEnemyCreation", this.onEnemyCreation.bind(this));
        this.socket.on("onEnemyStarted", this.onEnemyStarted.bind(this));
        this.socket.on("gameFinished", this.onGameFinished.bind(this));
      }

      this.socket.on("enemyHitNetwork", this.onEnemyHitNetwork.bind(this));
    },
    launchGame: function(){
      this.broadcastToRoom("onGameLaunched");
      WVRTD.gameLaunchUI.hideIntroUI();
      document.querySelector("#windSound").components["sound"].playSound();

      document.querySelector("[wvrtd-enemy-wave]").components["wvrtd-enemy-wave"].launchWave(1, 10000);
    },
    onGameLaunched : function(senderID, msg, data){
      WVRTD.gameLaunchUI.hideIntroUI();
      document.querySelector("#windSound").components["sound"].playSound();
    },
    onEnemyStarted : function(senderID, msg, data){
      document.querySelector("[wvrtd-enemy-pool]").components["wvrtd-enemy-pool"].start();
    },
    sendEnemyCreation : function(enemys){
      this.socket.emit("enemyCreation", {roomName : this.roomName, client: this.clientState, enemys: enemys});
    },
    onEnemyCreation : function(data){
      document.querySelector("[wvrtd-enemy-pool]").components["wvrtd-enemy-pool"].loadMonsters(data.enemys);
    },
    onEnemyStarted: function(){
      document.querySelectorAll("[class^=enemy]").forEach(function(enemyElt){
        enemyElt.hasStarted = true;
      })
    },
    onGameFinished: function(){
      console.log("====GAME FINISHED====");
    },
    initPlayer: function(){
      let player = document.createElement("a-entity");
      player.id = "player"+Math.floor(Math.random()*50);

      switch(this.clientState.type){
        case WVRTD.devDet.deviceType.GEARVR:
        case WVRTD.devDet.deviceType.MOBILE:
          player.setAttribute("wvrtd-player-threedof", {});
          break;
        case WVRTD.devDet.deviceType.DESKTOP:
          player.setAttribute("wvrtd-player-desktop", {});
          break;
        case WVRTD.devDet.deviceType.VIVE:
        case WVRTD.devDet.deviceType.RIFT:
        case WVRTD.devDet.deviceType.WINDOWSMR:
          player.setAttribute("wvrtd-player-sixdof", {});
          break;
      }

      document.querySelector("a-scene").appendChild(player);
    },
    /**
     * Listener for NAF entities to be created
     * @param  {Object} entity aframe entity received through network
     * @return {[type]}        [description]
     */
    onNAFEntityCreated : function(entity){
      if(entity.detail.el.components["networked"].data.template.indexOf("#enemy") !== -1){
        entity.detail.el.setAttribute("wvrtd-enemy-network", "");
      }
    },
    /**
     * Listener for enemy hit via an other player
     * @param  {[type]} senderID [description]
     * @param  {[type]} msg      [description]
     * @param  {[type]} data     [description]
     * @return {[type]}          [description]
     */
    onEnemyHitNetwork : function(senderID, msg, data){
      if(!document.querySelector("#"+data.enemyID)){
        return;
      }
      //Retrieve the enemy entity based on its ID, depending if user is game master or not
      let enemy = document.querySelector("#"+data.enemyID).components["wvrtd-enemy"] || document.querySelector("#"+data.enemyID).components["wvrtd-enemy-network"];
      enemy.onHit({hitPoints: data.hitPoints});
    }
  });

})();
