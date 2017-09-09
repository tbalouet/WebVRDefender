// Use of this source code is governed by an Apache license that can be
// found in the LICENSE file.
(function(){
  "use strict";
  require("./presentation.js");


  AFRAME.registerComponent('game-client', {
    init: function() {
      this.isInit = false;

      this.gameState = undefined;

      //TODO: Elaborate clientstate based on device
      this.clientState = {
        type : "threedof"
      }
    },
    initClient : function(){
      var that = this;

      window.onbeforeunload = this.onDisconnect.bind(this);

      NAF.connection.subscribeToDataChannel("gameStateUpdate", this.onGameStateUpdate.bind(this));

      this.clientState.ID = NAF.clientId;
      NAF.connection.network.easyrtc.sendServerMessage("clientConnect", { roomName: NAF.room, clientState : this.clientState }, 
        function(msgType, msgData){
          that.gameState = msgData.gameState;
          console.log("[Game-Client]", "Gamestate received", that.gameState);
          that.initialSetup();
          setTimeout(that.sendGameStateUpdate.bind(that), 250);
        }, function(errorCode, errorText){
          console.log("Error was " + errorText);
        });
    },
    sendGameStateUpdate: function(){
      NAF.connection.broadcastDataGuaranteed("gameStateUpdate", {type : "broadcast", gameState : this.gameState});
    },
    onDisconnect : function(){
      var that = this;

      NAF.connection.network.easyrtc.sendServerMessage("clientDisconnect", { roomName: NAF.room, clientID : NAF.clientId }, 
        function(msgType, msgData){
          that.gameState = msgData.gameState;
          console.log("[Game-Client]", "Gamestate received", that.gameState);
          setTimeout(that.sendGameStateUpdate.bind(that), 250);
        }, function(errorCode, errorText){
          console.log("Error was " + errorText);
        });
    },
    sendGameStateToServer : function(){
      var that = this;

      NAF.connection.network.easyrtc.sendServerMessage("gameStateUpdated", { roomName: NAF.room, clientState : this.clientState }, 
        function(msgType, msgData){
          that.gameState = msgData.gameState;
          console.log("[Game-Client]", "Gamestate received", that.gameState);
          setTimeout(that.sendGameStateUpdate.bind(that), 250);
        }, function(errorCode, errorText){
          console.log("Error was " + errorText);
        });
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
    initialSetup : function(){
      switch(this.clientState.type){
        case "threedof":
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
          break;
      }

      let player = document.createElement("a-entity");
      player.id = "player";
      player.setAttribute("networked", {
        template          : "#tower-template",
        showLocalTemplate : false
      });
      player.setAttribute("assign-slot", { slotID : this.clientState.slotID});
      player.setAttribute("camera", {});
      player.setAttribute("look-controls", {});
      player.setAttribute("presentation-display", {});
      var cursor = document.createElement("a-cursor");
      player.appendChild(cursor);

      document.querySelector("a-scene").appendChild(player);
    }
  });

})()
