/* global AFRAME */
(function(){
  "use strict";

  AFRAME.registerComponent("wvrtd-enemy-wave", {
    schema:{
      waveTimeout  : {type: "number", default: 10000}
    },
    init: function() {
      this.waves = {
        "wave1" : {
          enemys : [
            {type : "monster", number : 5, health : 100}
          ],
          timeout: 10000
        },
        "wave2" : {
          enemys : [
            {type : "monster", number : 5, health : 100},
            {type : "dragon", number : 3, health : 200},
          ],
          timeout: 10000
        },
      }

      this.currentWave = 0;


      this.el.addEventListener("enemy-finished", this.onEnemyFinished.bind(this));
    },
    launchWave: function(waveNumber){
      this.currentWave = waveNumber || ++this.currentWave;

      if(!this.waves["wave" + this.currentWave]){
        this.wavesFinished();
        return;
      }

      document.querySelector("[wvrtd-enemy-pool]").components["wvrtd-enemy-pool"].loadMonsters(this.waves["wave" + this.currentWave].enemys);
      setTimeout(function(){
        document.querySelector("[wvrtd-enemy-pool]").components["wvrtd-enemy-pool"].start();
      }, this.waves["wave" + this.currentWave].timeout);
    },
    launchNextWave: function(){
      this.launchWave();
    },
    onEnemyFinished: function(){
      var enemys = document.querySelectorAll("[wvrtd-enemy]");
      var allFinished = true;
      for(var i = 0; i < enemys.length; ++i){
        if(!enemys[i].components["wvrtd-enemy"].hasFinished){
          allFinished = false;
          break;
        }
      }
      if(allFinished){
        this.launchNextWave();
      }
    },
    wavesFinished: function(){
      console.log("====GAME FINISHED====");
    }
  });

})();
