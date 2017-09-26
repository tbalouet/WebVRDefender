/* global AFRAME, NAF */
// Use of this source code is governed by an Apache license that can be
// found in the LICENSE file.
(function(){
  "use strict";

  /**
  * Handle discussions with the server and Game State
  * @return {[type]}                   [description]
  */
  AFRAME.registerComponent("game-client", {
    init: function() {
      //General game state with informations about all clients
      this.gameState = undefined;

      //TODO: Elaborate clientstate based on device
      this.clientState = {
        ID     : 0,
        type   : "threedof",
        slotID : undefined
      };
    },
    /**
    * Init the client, called when connected to the server
    * @return {[type]} [description]
    */
    initClient : function(){
      window.onbeforeunload = this.onDisconnect.bind(this);

      NAF.connection.subscribeToDataChannel("gameStateUpdate", this.onGameStateUpdate.bind(this));

      this.clientState.ID = NAF.clientId;
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

      NAF.connection.network.easyrtc.sendServerMessage(evtName, { roomName: NAF.room, clientState : this.clientState },
        function(msgType, msgData){
          that.gameState = msgData.gameState;
          console.log("[Game-Client]", "Gamestate received after "+evtName, that.gameState);

          setTimeout(that.sendGameStateUpdate.bind(that), 250);

          callback();
        }, function(errorCode, errorText){
          console.log("[Game-Client]", "Error on calling server for " + evtName, errorText);
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
        console.log("[Game-Client]", "Gamestate updated", this.gameState);
      },
      /**
      * Init player entity by checking its type
      * @return {[type]} [description]
      */
      initialSetup : function(){
        let player = document.createElement("a-entity");
        player.id = "player"+Math.floor(Math.random()*50);

        switch(this.clientState.type){
          case "threedof":
          let slotID = this.getUnusedSlot();
          if(slotID){
            player.setAttribute("player", { slotID : this.clientState.slotID, type : this.clientState.type});
          }
          break;
        }

        document.querySelector("a-scene").appendChild(player);
      },
      /**
      * Check list of slots against already used one
      * @return {int} returns first free slot
      */
      getUnusedSlot : function(){
        let slots = document.querySelector("[slot-threedof]").children;
        let slotID = undefined;
        for(let i = 0;i < slots.length; ++i){
          let isTaken = false;
          for(let clientID in this.gameState.clients){
            if(this.gameState.clients.hasOwnProperty(clientID)){
              let aClient = this.gameState.clients[clientID];
              if(aClient.type === "threedof" && aClient.slotID === slots[i].id){
                isTaken = true;
                break;
              }
            }
          }
          if(!isTaken){
            slotID = slots[i].id;
            break;
          }
        }

        if(slotID){
          this.clientState.slotID = slotID;
          this.sendGameStateToServer();
        }
        return slotID;
      }
    });

  })();
