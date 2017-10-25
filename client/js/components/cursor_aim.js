/* global AFRAME */
(function(){
  "use strict";

  AFRAME.registerComponent("wvrtd-cursor-aim", {
    schema: {
      radiusInner: { type: "number", default: 0.1 },
      radiusOuter: { type: "number", default: 0.15 },
      color: { type: "string", default: "black" },
      position: { type: "string", default: "0 0 0" },
      rotation: { type: "string", default: "0 0 0" },
      enemyHit  : {type: "array", default: []},
    },
    init: function() {
      var cursor = document.createElement("a-ring");
      cursor.setAttribute("cursor", "");
      cursor.setAttribute("position", this.data.position);
      cursor.setAttribute("rotation", this.data.rotation);
      cursor.setAttribute("radius-inner", this.data.radiusInner);
      cursor.setAttribute("radius-outer", this.data.radiusOuter);
      cursor.setAttribute("color", this.data.color);
      this.el.appendChild(cursor);

      var enemyHitClasses = "." + this.data.enemyHit.join(" .");
      this.el.setAttribute("raycaster", {objects: enemyHitClasses });
      this.el.addEventListener("mouseenter", this.onMouseEnter.bind(this));

      this.currentTarget = undefined;
    },
    onMouseEnter: function(data){
      var containsClass= false;
      for(var i = 0; i < this.data.enemyHit.length; ++i){
        if(data.detail.intersectedEl.classList.contains(this.data.enemyHit[i])){
          containsClass = true;
          break;
        }
      }
      if(containsClass && data.detail.intersectedEl.hasStarted){
        this.el.querySelector("[cursor]").setAttribute("material", {color:"red"});
        this.currentTarget = data.detail.intersectedEl;
      }
      else{
        this.el.querySelector("[cursor]").setAttribute("material", {color:"black"});
        this.currentTarget = null;
      }
    }
  });
})();
