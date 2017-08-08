(function(){
  "use strict";

  AFRAME.registerComponent('assign-slot', {
    init: function() {
      let id = document.querySelectorAll(".tower").length;
      var newpos = document.getElementById("slot"+id).getAttribute("position");
      this.el.setAttribute("position", newpos);
    }
  });

})()