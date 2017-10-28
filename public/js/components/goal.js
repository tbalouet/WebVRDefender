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

      this.mesh = document.createElement("a-entity")
      this.mesh.setAttribute("id", "goal-mesh");
      this.mesh.setAttribute("scale", "0.15 0.15 0.15");
      this.setModel("public/assets/models/castle/");
      this.el.appendChild(this.mesh);


      this.el.setAttribute("wvrtd-life-bar", {life : this.data.life, height : 0.2, radius : 0.01, position: "-0.124 0.225 -0.113"});

      NAF.connection.subscribeToDataChannel("goalHitNetwork", this.onGoalHitNetwork.bind(this));

      // could have also used a component function
      this.el.addEventListener('enemy-entered', this.onEnemyEntered.bind(this));
      this.el.addEventListener('killed', this.onKilled.bind(this));
    },
    setModel: function(modelPath){
      this.mesh.setAttribute("gltf-model", modelPath + "scene.gltf");
      console.log("[WVRTD-Goal]", "Castle degrading to", modelPath);
    },
    onEnemyEntered: function(data){
      NAF.connection.broadcastDataGuaranteed("goalHitNetwork", {type : "broadcast", gameState : this.gameState});
      this.el.emit("hit", data.detail);
    },
    onHit: function(){
      console.log("[WVRTD-Goal]", "============I WAS HIT!!!============");

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
    onKilled: function(){
      document.querySelector("[wvrtd-enemy-wave]").emit("goal-destroyed");
    },
    onGoalHitNetwork: function(senderID, msg, data){
      this.onHit();
    }
  });

})();
