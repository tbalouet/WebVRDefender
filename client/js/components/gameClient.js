// Use of this source code is governed by an Apache license that can be
// found in the LICENSE file.
(function(){
  "use strict";


  AFRAME.registerComponent('game-client', {
    init: function() {
      this.isInit = false;

      this.gameState = {
        isMaster : false,
        clients  : {}
      }

      this.clientState = {
        type : "3dof"
      }
    },
    initClient : function(){
      var that = this;
      this.setListeners();

      if(!this.gameState.isMaster){        
        NAF.connection.subscribeToDataChannel("getClientState", this.onGetClientState.bind(this));
        console.log("[Game-Client]", "ClientState sent");
      }
      else{
        document.body.addEventListener("occupantsReceived", this.onOccupantsReceived.bind(this));
      }
    },
    setListeners : function(evt){
      NAF.connection.subscribeToDataChannel("gameStateUpdate", this.onGameStateUpdate.bind(this));
    },
    onOccupantsReceived : function(event){
      if(this.gameState.isMaster){
        let newClientID = event.detail.myInfo.easyrtcid;
        NAF.connection.broadcastDataGuaranteed("getClientState", {type : "unicast", clientID : newClientID});
        console.log("[Game-Client]", "ClientState asked", newClientID);
      }
    },
    onGetClientState : function(senderID, msg, data){
      console.log("CLIENT STATE ASKED");
    }
    onGameStateUpdate : function(senderID, msg, data){
      if(!this.gameState.isMaster){
        this.gameState = data.gameState;
        console.log("[Game-Client]", "Gamestate received", this.gameState);
      }
    },
    initMesh : function(){
      // let nbOccupants = 1;
      // for(let occ in this.occupantList){
      //   if(this.occupantList.hasOwnProperty(occ)){
      //     nbOccupants++;
      //   }
      // }
      // console.log("Room occupants: ", nbOccupants);
      let nbOccupants = Math.random()*4;
          
      let player = document.createElement("a-entity");
      player.id = "player";
      player.setAttribute("networked", {
        template          : "#tower-template",
        showLocalTemplate : false
      });
      player.setAttribute("assign-slot", { slotNum : nbOccupants});
      player.setAttribute("camera", {});
      player.setAttribute("look-controls", {});

      document.querySelector("a-scene").appendChild(player);
    }
  });

})()
