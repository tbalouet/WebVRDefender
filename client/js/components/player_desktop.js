/* global AFRAME */
(function(){
  "use strict";

  var DOWN_VECTOR = new THREE.Vector3(0, -1, 0);

  AFRAME.registerComponent("wvrtd-player-desktop", {
    dependencies: ['wvrtd-lookdown-controls'],
    schema: {
      slotID: { type: "string", default: "" },
      type: { type: "string", default: "" }
    },
    init: function() {
      var that = this;
      this.el.setAttribute("networked", {
        template          : "#panda-template",
        showLocalTemplate : false
      });

      this.el.setAttribute("position", "3 10 2");
      var camera = document.createElement("a-camera");
      camera.setAttribute("user-height", 0);
      camera.setAttribute("look-controls-enabled", false);
      camera.setAttribute("rotation", "-90 0 0");
      this.el.appendChild(camera);

      this.el.setAttribute("wvrtd-lookdown-controls", {});

      this.currentTarget = undefined;
      this.formerPosition = new THREE.Vector3().copy(this.el.object3D.position);


      var cursor = document.createElement("a-ring");
      cursor.setAttribute("cursor", "");
      cursor.setAttribute("position", "0 -3 0");
      cursor.setAttribute("rotation", "-90 0 0");
      cursor.setAttribute("radius-inner", 0.1);
      cursor.setAttribute("radius-outer", 0.15);
      cursor.setAttribute("color", "black");
      this.el.appendChild(cursor);

      this.el.setAttribute("raycaster", {objects: ".enemy"});
      this.el.addEventListener("mouseenter", this.onMouseEnter.bind(this));
      document.addEventListener("keyup", this.onKeyUp.bind(this));
    },
    onMouseEnter: function(data){
      if(data.detail.intersectedEl.classList.contains("enemy")){
        this.el.querySelector("[cursor]").setAttribute("material", {color:"red"});
        this.currentTarget = data.detail.intersectedEl;
      }
      else{
        this.el.querySelector("[cursor]").setAttribute("material", {color:"black"});
        this.currentTarget = null;
      }
    },
    onKeyUp: function(event){
      var key = event.keyCode ? event.keyCode : event.which;
      if (key == 32 && this.currentTarget) {
        this.currentTarget.emit("hit");
      }
    }
  });

})();
