// Use of this source code is governed by an Apache license that can be
// found in the LICENSE file.
(function(){
  "use strict";


  AFRAME.registerComponent('game-client', {
    init: function() {
      this.isInit = false;
      document.body.addEventListener("occupantsReceived", this.onOccupantsReceived.bind(this));


      NAF.connection.network.easyrtc.webSocket.addEventListener("tartelette", function(senderRtcId, dataType, data, targetRtcId){
        debugger;
      })
    },
    onOccupantsReceived : function(evt){
      this.occupantList = evt.detail.occupantList;
      if(!this.isInit){
        this.roomName     = evt.detail.name;
        this.myInfo       = evt.detail.myInfo;

        this.initClient();
        this.isInit = true;
      }
    },
    initClient : function(){
      let nbOccupants = 1;
      for(let occ in this.occupantList){
        if(this.occupantList.hasOwnProperty(occ)){
          nbOccupants++;
        }
      }
      console.log("Room occupants: ", nbOccupants);
          
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
