/* global AFRAME */
(function(){
  "use strict";

  AFRAME.registerComponent("wvrtd-player-threedof", {
    schema:{
      hitPoints  : {type: "number", default: 50},
      enemyHit  : {type: "array", default: ["enemyMonster, enemyDragon"]},
    },
    init: function() {
      var that = this;
      this.el.setAttribute("networked", {
        template          : "#tower-template",
        showLocalTemplate : true
      });

      this.el.setAttribute("wvrtd-assign-slot", {});
      this.el.setAttribute("camera", {});
      this.el.setAttribute("look-controls", {});

      this.el.setAttribute("wvrtd-cursor-aim", {
        position : "0 0 -3",
        radiusInner : 0.1,
        radiusOuter : 0.15,
        color : "black",
        enemyHit : this.data.enemyHit
      });

      document.addEventListener("click", this.onClick.bind(this));
    },
    onClick: function(event){
      var cursorAim = this.el.components["wvrtd-cursor-aim"];
      if(!cursorAim.currentTarget){
        return;
      }

      cursorAim.currentTarget.emit("hit", {hitPoints: this.data.hitPoints, origin: this.el});
      cursorAim.currentTarget = undefined;
    }
  });
})();
