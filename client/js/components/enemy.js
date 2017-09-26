/* global AFRAME */
(function(){
  "use strict";

  AFRAME.registerComponent("a-enemy", {
    schema:{
      type        : {type: "string", default: "monster"},
      scaleFactor : {type: "number", default: 5},
      rotation    : {type: "string", default: "0 0 0"},
      dur         : {type: "number", default: 20000},
      delay       : {type: "number", default: 10000},
      soundKill   : {type: "string", default: ""}
    },
    init: function() {
      var el = this.el;
      el.addEventListener("hit", this.onHit);
      el.setAttribute("networked", {
        template          : "#enemy-template",
        showLocalTemplate : false
      });

      var model = document.createElement("a-obj-model");
      model.setAttribute("src", "#"+this.data.type+"-obj");
      model.setAttribute("mtl", "#"+this.data.type+"-mtl");

      model.setAttribute("rotation", this.data.rotation);
      model.setAttribute("scale", this.data.scaleFactor + " " + this.data.scaleFactor + " " + this.data.scaleFactor);
      el.appendChild(model);

      el.setAttribute("alongpath", "rotate:true ; curve: #"+this.data.type+"-track; delay:" + this.data.delay + "; dur:"+this.data.dur+";");
      el.addEventListener('movingended', function () {
        if (el.getAttribute("visible")){
          document.querySelector("[goal]").emit("hit");
        }
      });

      el.setAttribute("sound", "on: kill; src: url("+this.data.soundKill+")");
    },
    onHit: function(data){
      el.setAttribute("visible", false);
      el.emit("kill");
    }
  });

  AFRAME.registerComponent('enemy-pool', {
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
        enemy.setAttribute("a-enemy", {
          type        : this.enemyTypes[0].type,
          scaleFactor : Math.random()+5,
          rotation    : "0 180 0",
          dur         : Math.random()*20000,
          delay       : 10000,//5000 + Math.random()*5000,
          soundKill   : "http://vatelier.net/MyDemo/WebVRDefender/public/assets/sounds/Zombie_In_Pain-SoundBible.com-134322253.mp3"
        });
        this.el.appendChild(enemy);
      }

      // wave 2
      for (var i=0; i< this.enemyTypes[1].number; i++){
        var enemy = document.createElement("a-entity");
        enemy.setAttribute("a-enemy", {
          type        : this.enemyTypes[1].type,
          scaleFactor : Math.random()+3,
          rotation    : "0 0 0",
          dur         : Math.random()*20000,
          delay       : 5000 + Math.random()*5000,
          soundKill   : "http://vatelier.net/MyDemo/WebVRDefender/public/assets/sounds/European_Dragon_Roaring_and_breathe_fire-daniel-simon.mp3"
        });
        this.el.appendChild(enemy);
      }
    }
  });

})();
