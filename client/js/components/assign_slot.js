/* global AFRAME */
(function(){
  "use strict";

  AFRAME.registerComponent("wvrtd-assign-slot", {
    schema: {
      slotID: { type: "string", default: "" }
    },
    init: function() {
      this.data.slotID = this.getUnusedSlot();
      this.el.setAttribute("position", document.getElementById(this.data.slotID).getAttribute("position"));
      this.el.setAttribute("rotation", document.getElementById(this.data.slotID).getAttribute("rotation"));
      console.log("Slot assigned:", this.data.slotID);
    },
    /**
    * Check list of slots against already used one
    * @return {int} returns first free slot
    */
    getUnusedSlot : function(){
      let gameClient = document.querySelector("[wvrtd-game-client]").components["wvrtd-game-client"];
      let slots = document.querySelector("[wvrtd-slot-threedof]").children;
      let slotID = undefined;
      for(let i = 0;i < slots.length; ++i){
        let isTaken = false;
        for(let clientID in gameClient.gameState.clients){
          if(gameClient.gameState.clients.hasOwnProperty(clientID)){
            let aClient = gameClient.gameState.clients[clientID];
            if(aClient.slotID === slots[i].id){
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
        gameClient.clientState.slotID = slotID;
        gameClient.sendGameStateToServer();
      }
      return slotID;
    }
  });

})();
