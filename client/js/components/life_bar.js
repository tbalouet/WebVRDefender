/* global AFRAME */
(function(){
  "use strict";

  AFRAME.registerComponent("wvrtd-life-bar", {
    schema: {
      life: { type: "number", default: 10 },
      height: { type: "number", default: 1 },
      radius: { type: "number", default: 0.2 },
      position: { type: "string", default: "0.5 0.5 0" }
    },
    init: function() {
      this.currentLife = this.data.life;

      this.lifeBar = document.createElement("a-cylinder");
      this.lifeBar.id = "lifeBar_" + (Math.floor(Math.random() * 100));
      this.lifeBar.setAttribute("height", this.data.height);
      this.lifeBar.setAttribute("radius", this.data.radius);
      this.lifeBar.setAttribute("material", {color: this.colorMyLife(1)});
      this.lifeBar.setAttribute("position", this.data.position);
      this.el.appendChild(this.lifeBar);

      this.el.addEventListener("hit", this.onHit.bind(this));
    },
    onHit: function(data){
      this.currentLife -= (data.detail ? data.detail.hitPoints : data.hitPoints);
      if(this.currentLife > 0){
        var ratio = this.currentLife / this.data.life;
        this.lifeBar.setAttribute("height", this.data.height * ratio);
        this.lifeBar.setAttribute("material", {color: this.colorMyLife(ratio)});
      }
      else{
        this.lifeBar.setAttribute("visible", false);
        this.el.emit("killed");
      }
    },
    colorMyLife: function(ratio){
      if(ratio > (2/3)){
        return "green";
      }
      else if(ratio > (1/3)){
        return "orange";
      }
      else{
        return "red";
      }
    }
  });

})();
