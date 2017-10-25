/* global AFRAME */
(function(){
  "use strict";

  var DOWN_VECTOR = new THREE.Vector3(0, -1, 0);

  AFRAME.registerComponent("wvrtd-player-desktop", {
    dependencies: ['wvrtd-lookdown-controls'],
    schema:{
      hitPoints  : {type: "number", default: 50},
      enemyHit  : {type: "array", default: ["enemyMonster"]},
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


      this.el.setAttribute("wvrtd-cursor-aim", {
        position : "0 -3 0",
        rotation : "-90 0 0",
        radiusInner : 0.1,
        radiusOuter : 0.15,
        color : "black",
        enemyHit : this.data.enemyHit
      });
      document.addEventListener("keyup", this.onKeyUp.bind(this));
    },
    onKeyUp: function(event){
      var cursorAim = this.el.components["wvrtd-cursor-aim"];

      var key = event.keyCode ? event.keyCode : event.which;
      if (key == 32 && cursorAim.currentTarget) {
        cursorAim.currentTarget.emit("hit", {hitPoints: this.data.hitPoints, origin: this.el});
      }
    }
  });

})();
