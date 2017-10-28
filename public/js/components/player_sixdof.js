/* global AFRAME */
(function(){
  "use strict";

  AFRAME.registerComponent("wvrtd-player-sixdof", {
    schema:{
      hitPoints  : {type: "number", default: 50},
      enemyHit  : {type: "array", default: ["enemyMonster"]},
      handDisabledTime: {type: "number", default: 1000}
    },
    init: function() {
      this.el.setAttribute("networked", {
        template          : "#giant-head-template",
        showLocalTemplate : false
      });


      this.el.setAttribute("position", "-1 1.4 7");
      this.el.setAttribute("rotation", "0 180 0");
      var camera = document.createElement("a-camera");
      camera.setAttribute("user-height", 0);
      this.el.appendChild(camera);

      this.leftHand = document.createElement("a-entity");
      this.leftHand.id = "leftHand" + (Math.floor(Math.random() * 100));
      this.leftHand.setAttribute("networked", {
        template          : "#giant-hand-left-template",
        showLocalTemplate : true
      });
      this.leftHand.setAttribute("windows-motion-controls", {hand : "left", model: false});
      this.el.appendChild(this.leftHand);

      this.rightHand = document.createElement("a-entity");
      this.rightHand.id = "rightHand" + (Math.floor(Math.random() * 100));
      this.rightHand.setAttribute("networked", {
        template          : "#giant-hand-right-template",
        showLocalTemplate : true
      });
      this.rightHand.setAttribute("windows-motion-controls", {hand : "right", model: false});
      this.el.appendChild(this.rightHand);
    },
    disableHand: function(hand){
      hand.disabled = true;
      setTimeout(function(){
        hand.disabled = false;
      }, this.data.handDisabledTime);
    },
    tick: function(){
      var leftHandPos = this.leftHand.object3D.getWorldPosition();
      var rightHandPos = this.rightHand.object3D.getWorldPosition();
      this.collideElements = document.querySelectorAll("." + this.data.enemyHit);
      for(var i =0; i < this.collideElements.length; ++i){
        var posElt = this.collideElements[i].object3D.getWorldPosition();
        if(!this.rightHand.disabled && rightHandPos.distanceTo(posElt) < 1){
          this.collideElements[i].emit("hit", {hitPoints: this.data.hitPoints, origin: this.el});
          this.disableHand(this.rightHand);
        }
        else if(!this.leftHand.disabled && leftHandPos.distanceTo(posElt) < 1){
          this.collideElements[i].emit("hit", {hitPoints: this.data.hitPoints, origin: this.el});
          this.disableHand(this.leftHand);
        }
      }
    }
  });

})();
