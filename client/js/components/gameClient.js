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
    },
    setDevice: function(deviceType){      
      //TODO: Elaborate clientstate based on device
      this.clientState = {
        ID     : 0,
        type   : deviceType,
        slotID : undefined
      };
      if(this.serverConnected){
        this.initClient();
      }
    },
    /**
    * Init the client, called when connected to the server
    * @return {[type]} [description]
    */
    initClient : function(){
      if(this.clientState){
        window.onbeforeunload = this.onDisconnect.bind(this);

        NAF.connection.subscribeToDataChannel("gameStateUpdate", this.onGameStateUpdate.bind(this));

        this.clientState.ID = NAF.clientId;
        this.sendConnect();

        document.body.addEventListener('clientDisconnected', this.onClientDisconnected.bind(this));
      }
      this.serverConnected = true;
    },
    sendConnect: function(){
      this.sendEvent("clientConnect", this.initialSetup.bind(this));
    },
    /**
    * Send an event to the server and fetch back the Game State before broadcasting it
    * @param  {[type]}   evtName  [description]
    * @param  {Function} callback [description]
    * @return {[type]}            [description]
    */
    sendEvent: function(evtName, callback){
      var that = this;
      callback = callback || function(){};

      NAF.connection.adapter.easyrtc.sendServerMessage(evtName, { roomName: NAF.room, clientState : this.clientState },
        function(msgType, msgData){
          that.gameState = msgData.gameState;
          console.log("[WVRTD-Game-Client]", "Gamestate received after "+evtName, that.gameState);
          WVRTD.gameLaunchUI.createPlayerList(that.gameState); 

          setTimeout(that.sendGameStateUpdate.bind(that), 250);

          callback();
        }, function(errorCode, errorText){
          console.log("[WVRTD-Game-Client]", "Error on calling server for " + evtName, errorText);
        });
      },
      /**
      * Function to broadcast a received update of the game state
      * @return {[type]} [description]
      */
      sendGameStateUpdate: function(){
        NAF.connection.broadcastDataGuaranteed("gameStateUpdate", {type : "broadcast", gameState : this.gameState});
      },
      /**
      * Event called on window.onbeforeunload when client disconnects
      * @return {[type]} [description]
      */
      onDisconnect : function(){
        this.sendEvent("clientDisconnect");
      },
      /**
      * Send game state to server when updated
      * @return {[type]} [description]
      */
      sendGameStateToServer : function(){
        this.sendEvent("gameStateUpdated");
      },
      /**
      * Event received by clients when gameState is updated
      * @param  {[type]} senderID [description]
      * @param  {[type]} msg      [description]
      * @param  {[type]} data     [description]
      * @return {[type]}          [description]
      */
      onGameStateUpdate : function(senderID, msg, data){
        this.gameState = data.gameState;
        console.log("[WVRTD-Game-Client]", "Gamestate updated", this.gameState);
        WVRTD.gameLaunchUI.createPlayerList(this.gameState);  
      },
      onClientDisconnected: function(evt){
        this.sendEvent("getGameState");
      },
      /**
      * Init player entity by checking its type
      * @return {[type]} [description]
      */
      initialSetup : function(){
        let player = document.createElement("a-entity");
        player.id = "player"+Math.floor(Math.random()*50);

        switch(this.clientState.type){
          case WVRTD.devDet.deviceType.GEARVR:
          case WVRTD.devDet.deviceType.MOBILE:
          case WVRTD.devDet.deviceType.DESKTOP://For now
            player.setAttribute("wvrtd-player", { type : this.clientState.type});
          break;
        }

        document.querySelector("a-scene").appendChild(player);

        if(Object.values(this.gameState.clients).length === 1){
          //If user is the first one, he's considered the game master
          //He'll then create an enemy pool
          let enemyPool = document.createElement("a-entity");
          enemyPool.setAttribute("wvrtd-enemy-pool", "");
          document.querySelector("a-scene").appendChild(enemyPool);
        }
        else{
          //Otherwise, he'll be looking for enemy entities to be created
          document.body.addEventListener('entityCreated', this.onNAFEntityCreated.bind(this));
          WVRTD.gameLaunchUI.removeLaunchGame();
          NAF.connection.subscribeToDataChannel("gameLaunched", this.onGameLaunched.bind(this));
        }

        NAF.connection.subscribeToDataChannel("enemyHitNetwork", this.onEnemyHitNetwork.bind(this));
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
        //Retrieve the enemy entity based on its ID, depending if user is game master or not
        let enemy = document.querySelector("#"+data.enemyID).components["wvrtd-enemy"] || document.querySelector("#"+data.enemyID).components["wvrtd-enemy-network"];
        enemy.onHit();
      },
      launchGame: function(){
        NAF.connection.broadcastDataGuaranteed("gameLaunched", {type : "broadcast"});
        WVRTD.gameLaunchUI.hideIntroUI();
        document.querySelector("#windSound").components["sound"].playSound();

        setTimeout(function(){
          document.querySelector("[wvrtd-enemy-pool]").components["wvrtd-enemy-pool"].start();
          document.querySelector("#windSound").components["sound"].play();
        }, 10000);
      },
      onGameLaunched : function(senderID, msg, data){
        WVRTD.gameLaunchUI.hideIntroUI();
        document.querySelector("#windSound").components["sound"].playSound();
      }
    });

  })();
