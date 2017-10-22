/* global AFRAME */
(function(){
  "use strict";

  AFRAME.registerComponent("wvrtd-enemy", {
    schema:{
      type        : {type: "string", default: "monster"},
      scaleFactor : {type: "number", default: 5},
      rotation    : {type: "string", default: "0 0 0"},
      dur         : {type: "number", default: 20000},
      delay       : {type: "number", default: 10000},
      soundKill   : {type: "string", default: ""}
    },
    init: function() {
      var that = this;
      this.el.setAttribute("networked", {
        template          : "#enemy-"+this.data.type+"-template",
        showLocalTemplate : true
      });
      this.el.id = "naf-" + this.el.components["networked"].data.networkId;

      this.el.setAttribute("cursor-listener", "");

      this.el.setAttribute("alongpath", "rotate:true ; curve: #"+this.data.type+"-track; delay:" + this.data.delay + "; dur:"+this.data.dur+";");
      this.el.addEventListener('movingended', function () {
        if (that.el.getAttribute("visible")){
          document.querySelector("[wvrtd-goal]").emit("enemy-entered");
        }
      });

      // this.el.setAttribute("sound", "on: kill; src: url("+this.data.soundKill+")");

      this.el.addEventListener("hit", function(){
        that.onHit();
        NAF.connection.broadcastDataGuaranteed("enemyHitNetwork", {type : "broadcast", enemyID : that.el.id});
      });

      this.el.components["alongpath"].pauseComponent();
    },
    start: function(){
      this.el.components["alongpath"].playComponent();
    },
    onHit: function(data){
      this.el.setAttribute("visible", false);
	// todo check health
      this.el.emit("kill");
    }
  });

  AFRAME.registerComponent("wvrtd-enemy-network", {
    init: function() {
      var that = this;
      this.el.setAttribute("cursor-listener", "");

      // this.el.setAttribute("sound", "on: kill; src: url("+this.data.soundKill+")");

      this.el.addEventListener("hit", function(){
        that.onHit();
        NAF.connection.broadcastDataGuaranteed("enemyHitNetwork", {type : "broadcast", enemyID : that.el.id});
      });
    },
    onHit: function(data){
      this.el.setAttribute("visible", false);
      this.el.emit("kill");
    }
  });

  AFRAME.registerComponent('wvrtd-enemy-pool', {
    init: function() {
      this.enemyTypes = [ {
        type : "monster",
        scaleAdd : 5,
        rotation : "0 180 0",
        durAdd: 20000,
        durMult: 10000,
        delayAdd: 5000,
        delayMult: 5000,
        soundKill : "http://vatelier.net/MyDemo/WebVRDefender/public/assets/sounds/Zombie_In_Pain-SoundBible.com-134322253.mp3",
        number : 2
      },{
        type : "dragon",
        scaleAdd : 3,
        rotation : "0 0 0",
        durAdd: 20000,
        durMult: 10000,
        delayAdd: 5000,
        delayMult: 5000,
        soundKill : "http://vatelier.net/MyDemo/WebVRDefender/public/assets/sounds/Zombie_In_Pain-SoundBible.com-134322253.mp3",
        number : 3
      }];

      this.loadMonsters();
    },
    loadMonsters: function(){
      // wave 1
      for (var i=0; i < this.enemyTypes.length; i++){
        for (var j=0; j< this.enemyTypes[i].number; j++){
          var enemy = document.createElement("a-entity");
          enemy.setAttribute("wvrtd-enemy", {
            type        : this.enemyTypes[i].type,
            scaleFactor : Math.random() + this.enemyTypes[i].scaleAdd,
            rotation    : this.enemyTypes[i].rotation,
            dur         : this.enemyTypes[i].durAdd + Math.random() * this.enemyTypes[i].durMult,
            delay       : this.enemyTypes[i].delayAdd + Math.random() * this.enemyTypes[i].delayMult,
            soundKill   : this.enemyTypes[i].soundKill
          });
          this.el.appendChild(enemy);
        }
      }
    },
    start: function(){
      var enemys = this.el.querySelectorAll("[wvrtd-enemy]");
      for(let i = 0; i < enemys.length; ++i){
        enemys[i].components["wvrtd-enemy"].start();
      }
    }
  });

})();
