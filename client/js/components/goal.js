/* global AFRAME */
(function(){
  "use strict";

  AFRAME.registerComponent('wvrtd-goal', {
    dependencies: ["wvrtd-game-dynamics-parameters"],
    schema: {
      life: { type: "number", default: 10 }
	// overwritten by the game dynamics parameters component
    },
    init: function() {
      //var parameters = AFRAME.scenes[0].components["wvrtd-game-dynamics-parameters"].data;
      // despite the dependencies the scene at the time has no available components
      var that = this;

      this.currentLife = this.data.life;
      //this.currentLife = parameters.goalHealth;

      this.mesh = document.createElement("a-entity")
      this.mesh.setAttribute("id", "goal-mesh");
      this.mesh.setAttribute("scale", "0.15 0.15 0.15");
      this.setModel("public/assets/models/castle/");
      this.el.appendChild(this.mesh)

      this.lifeMeshIndicator = document.createElement("a-cylinder")
      // now to rescale because of parent
      this.lifeMeshIndicator.setAttribute("color", "green")
      this.lifeMeshIndicator.setAttribute("height", this.currentLife)
      this.lifeMeshIndicator.setAttribute("scale", "0.01 0.01 0.01")
      this.lifeMeshIndicator.setAttribute("position", "-0.124 0.168 -0.113")
      this.el.appendChild(this.lifeMeshIndicator);

      NAF.connection.subscribeToDataChannel("goalHitNetwork", this.onGoalHitNetwork.bind(this));

      // could have also used a component function
      this.el.addEventListener('enemy-entered', function(){
        NAF.connection.broadcastDataGuaranteed("goalHitNetwork", {type : "broadcast", gameState : this.gameState});
        that.onHit();
      });
    },
    setModel: function(modelPath){
      this.mesh.setAttribute("gltf-model", modelPath + "scene.gltf");
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
