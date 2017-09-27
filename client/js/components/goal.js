/* global AFRAME */
(function(){
  "use strict";

  AFRAME.registerComponent('wvrtd-goal', {
    schema: {
      life: { type: "number", default: 10 }
    },
    init: function() {
      var that = this;

      this.currentLife = this.data.life;

      this.mesh = document.createElement("a-obj-model")
      this.mesh.setAttribute("id", "goal-mesh")
      this.setModel("public/assets/models/castle/");
      this.el.appendChild(this.mesh)


      this.lifeMeshIndicator = document.createElement("a-cylinder")
      // now to rescale because of parent
      this.lifeMeshIndicator.setAttribute("color", "green")
      this.lifeMeshIndicator.setAttribute("height", this.currentLife)
      this.lifeMeshIndicator.setAttribute("scale", "0.05 0.05 0.05")
      this.lifeMeshIndicator.setAttribute("position", "0 0 0")
      this.el.appendChild(this.lifeMeshIndicator);

      NAF.connection.subscribeToDataChannel("goalHitNetwork", this.onGoalHitNetwork.bind(this));

      // could have also used a component function
      this.el.addEventListener('hit', function(){
        NAF.connection.broadcastDataGuaranteed("goalHitNetwork", {type : "broadcast", gameState : this.gameState});
        that.onHit();
      });
    },
    setModel: function(modelPath){
      var obj = "model.obj";
      var mtl = "materials.mtl";
      this.mesh.setAttribute("src", modelPath + obj);
      this.mesh.setAttribute("mtl", modelPath + mtl);
      console.log("[WVRTD-Goal]", "Castle degrading to", modelPath);
    },
    onHit: function(){
      console.log("[WVRTD-Goal]", "============I WAS HIT!!!============");
      --this.currentLife;
      this.lifeMeshIndicator.setAttribute("height", this.currentLife);

      if (this.currentLife < 6) {
        this.setModel("public/assets/models/castle_lvl1/");
      }
      else if (this.currentLife < 3) {
        this.life.setAttribute("color", "red")
        this.setModel("public/assets/models/castle_lvl2/");
      }
      else if (this.currentLife < 1) {
        this.life.setAttribute("color", "red")
        this.setModel("public/assets/models/castle_lvl3/");
      }
    },
    onGoalHitNetwork: function(senderID, msg, data){
      this.onHit();
    }
  });

})();
