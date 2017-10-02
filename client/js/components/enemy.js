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
          document.querySelector("[wvrtd-goal]").emit("hit");
        }
      });

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
        number : 2
      },{
        type : "dragon",
        number : 3
      }];

      this.loadMonsters();
    },
    loadMonsters: function(){
      // wave 1
      for (var i=0; i < this.enemyTypes[0].number; i++){
        var enemy = document.createElement("a-entity");
        enemy.setAttribute("wvrtd-enemy", {
          type        : this.enemyTypes[0].type,
          scaleFactor : Math.random()+5,
          rotation    : "0 180 0",
          dur         : 20000 + Math.random()*10000,
          delay       : 10000,//5000 + Math.random()*5000,
          soundKill   : "http://vatelier.net/MyDemo/WebVRDefender/public/assets/sounds/Zombie_In_Pain-SoundBible.com-134322253.mp3"
        });
        this.el.appendChild(enemy);
      }

      // wave 2
      for (var i=0; i< this.enemyTypes[1].number; i++){
        var enemy = document.createElement("a-entity");
        enemy.setAttribute("wvrtd-enemy", {
          type        : this.enemyTypes[1].type,
          scaleFactor : Math.random()+3,
          rotation    : "0 0 0",
          dur         : 20000 + Math.random()*10000,
          delay       : 5000 + Math.random()*5000,
          soundKill   : "http://vatelier.net/MyDemo/WebVRDefender/public/assets/sounds/European_Dragon_Roaring_and_breathe_fire-daniel-simon.mp3"
        });
        this.el.appendChild(enemy);
      }
    }
  });

})();
