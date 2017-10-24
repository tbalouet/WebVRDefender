/* global AFRAME */
(function(){
  "use strict";

  AFRAME.registerComponent("wvrtd-player-sixdof", {
    init: function() {
      this.el.setAttribute("networked", {
        template          : "#giant-head-template",
        showLocalTemplate : false
      });

      this.leftHand = document.createElement("a-entity");
      this.leftHand.id = "leftHand" + (Math.floor(Math.random() * 100));
      this.leftHand.setAttribute("networked", {
        template          : "#giant-hand-left-template",
        showLocalTemplate : true
      });
      this.leftHand.setAttribute("windows-motion-controls", {hand : "left", model: false});
      document.querySelector("a-scene").appendChild(this.leftHand);

      this.rightHand = document.createElement("a-entity");
      this.rightHand.id = "rightHand" + (Math.floor(Math.random() * 100));
      this.rightHand.setAttribute("networked", {
        template          : "#giant-hand-right-template",
        showLocalTemplate : true
      });
      this.rightHand.setAttribute("windows-motion-controls", {hand : "right", model: false});
      document.querySelector("a-scene").appendChild(this.rightHand);
    }
  });

})();
