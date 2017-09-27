/* global AFRAME */
(function(){
  "use strict";

  AFRAME.registerComponent("wvrtd-assign-slot", {
    schema: {
      slotID: { type: "string", default: "" }
    },
    init: function() {
      var newpos = document.getElementById(this.data.slotID).getAttribute("position");
      this.el.setAttribute("position", newpos);
      console.log("Slot assigned:", this.data.slotID);
    }
  });

})();
