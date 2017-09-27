/* global AFRAME */
(function(){
  "use strict";

  AFRAME.registerComponent("wvrtd-player", {
    schema: {
      slotID: { type: "string", default: "" },
      type: { type: "string", default: "" }
    },
    init: function() {
      var that = this;
      this.el.setAttribute("networked", {
        template          : "#tower-template",
        showLocalTemplate : true
      });

      this.el.setAttribute("wvrtd-assign-slot", { slotID : this.data.slotID});
      this.el.setAttribute("camera", {});
      this.el.setAttribute("look-controls", {});
      this.el.setAttribute("wvrtd-presentation-display", {});

      this.currentTarget = undefined;

      var cursor = document.createElement("a-ring");
      cursor.setAttribute("cursor", "fuse: true; fuseTimeout: 500");
      cursor.setAttribute("position", "0 0 -20");
      cursor.setAttribute("radius-inner", 0.5);
      cursor.setAttribute("radius-outer", 0.8);
      cursor.setAttribute("animation", {property: "scale", dir: "normal", dur: 200, easing: "easeInSine", to: "0.1 0.1 0.1", startEvents: "click"});
      cursor.setAttribute("color", "black");
      this.el.appendChild(cursor);

      cursor.addEventListener("click", function(data){
        that.currentTarget = data.detail.intersectedEl;
      });
      cursor.addEventListener("animationcomplete", function(data){
        if(that.currentTarget){
          that.currentTarget.emit("hit");
        }
        that.currentTarget = undefined;
        cursor.setAttribute("scale", "1 1 1");
      });
    }
  });

})();
