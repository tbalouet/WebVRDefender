(function(){
  "use strict";

  AFRAME.registerComponent('assign-slot', {
    schema: {
      slotNum: { type: 'int', default: 0 },
    },
    init: function() {
      var newpos = document.getElementById("slot"+(this.data.slotNum - 1)).getAttribute("position");
      this.el.setAttribute("position", newpos);
      console.log("Slot assigned:", this.data.slotNum);
    }
  });

})()