/* global AFRAME */
(function(){
  "use strict";

  AFRAME.registerComponent("wvrtd-enemy", {
    schema:{
      type        : {type: "string", default: "monster"},
      startPos    : {type: "string", default: "0 0 0"},
      rotation    : {type: "string", default: "0 0 0"},
      dur         : {type: "number", default: 40000},
      delay       : {type: "number", default: 10000},
      health      : {type: "number", default: 100},
      hitPoints   : {type: "number", default: 2},
      soundKill   : {type: "string", default: ""}
    },
    init: function() {
      var that = this;
      this.hasFinished = false;
      this.hasStarted = false;

      this.el.setAttribute("networked", {
        template          : "#enemy-"+this.data.type+"-template",
        showLocalTemplate : true
      });

      this.el.id = "naf-" + this.el.components["networked"].data.networkId;

      this.el.setAttribute("cursor-listener", "");

      this.el.setAttribute("wvrtd-life-bar", {life : this.data.health, height : 1.5, radius : 0.2});

      this.el.setAttribute("position", this.data.startPos);

      this.el.setAttribute("alongpath", "rotate:false ; curve: #"+this.data.type+"-track; delay:" + this.data.delay + "; dur:"+this.data.dur+";");
      this.el.addEventListener('movingended', this.onFinishedPath.bind(this));

      // this.el.setAttribute("sound", "on: kill; src: url("+this.data.soundKill+")");

      this.el.addEventListener("hit", function(data){
        NAF.connection.broadcastDataGuaranteed("enemyHitNetwork", {type : "broadcast", hitPoints: data.detail.hitPoints, enemyID : that.el.id});
      });
      this.el.addEventListener("killed", this.onKill.bind(this));

      this.el.components["alongpath"].pauseComponent();
    },
    onHit: function(data){
      this.el.components["wvrtd-life-bar"].onHit(data);
    },
    start: function(){
      this.el.components["alongpath"].playComponent();
      this.el.querySelector("[class^=enemy]").hasStarted = true;
    },
    onKill: function(data){
      console.log(this.data.type, 'killed')
      this.el.setAttribute("visible", false);
      this.hasFinished = true;
      document.querySelector("[wvrtd-enemy-wave]").emit("enemy-finished");
    },
    onFinishedPath: function(){
      if (this.el.components["wvrtd-life-bar"].currentLife > 0){
        document.querySelector("[wvrtd-goal]").emit("enemy-entered", {hitPoints: this.data.hitPoints, origin: this.el});
      }
      this.hasFinished = true;
      document.querySelector("[wvrtd-enemy-wave]").emit("enemy-finished");
      this.el.setAttribute("visible", false);
    }
  });

  AFRAME.registerComponent("wvrtd-enemy-network", {
    schema:{
      type        : {type: "string", default: "monster"},
      startPos    : {type: "string", default: "0 0 0"},
      rotation    : {type: "string", default: "0 0 0"},
      dur         : {type: "number", default: 40000},
      delay       : {type: "number", default: 10000},
      health      : {type: "number", default: 100},
      hitPoints   : {type: "number", default: 2},
      soundKill   : {type: "string", default: ""}
    },
    init: function() {
      var that = this;
      this.el.setAttribute("cursor-listener", "");

      // this.el.setAttribute("sound", "on: kill; src: url("+this.data.soundKill+")");

      this.el.setAttribute("wvrtd-life-bar", {life : this.data.health, height : 1.5, radius : 0.2});

      this.el.setAttribute("position", this.data.startPos);
      
      this.el.setAttribute("alongpath", "rotate:false ; curve: #"+this.data.type+"-track; delay:" + this.data.delay + "; dur:"+this.data.dur+";");
      this.el.components["alongpath"].pauseComponent();

      this.el.addEventListener("hit", function(data){
        NAF.connection.broadcastDataGuaranteed("enemyHitNetwork", {type : "broadcast", enemyID : that.el.id, hitPoints: data.detail.hitPoints});
      });
      this.el.addEventListener("killed", this.onKill.bind(this));
    },
    onHit: function(data){
      this.el.components["wvrtd-life-bar"].onHit(data);
    },
    onKill: function(data){
      console.log(this.data.type, 'killed')
      this.el.setAttribute("visible", false);
    },
  });

  AFRAME.registerComponent('wvrtd-enemy-pool', {
    dependencies: ["wvrtd-enemy-wave"],
    init: function() {
      this.enemyTypes = {
        "monster": {
          startPos: "-1.525 0.24 30.255",
          rotation : "0 180 0",
          durAdd: 20000,
          durMult: 10000,
          delayMult: 5000,
          health: 100,
          soundKill : "http://vatelier.net/MyDemo/WebVRDefender/public/assets/sounds/Zombie_In_Pain-SoundBible.com-134322253.mp3",
          number : 2
        },
        "dragon" : {
          startPos: "-9.96 2.834 27.57",
          rotation : "0 0 0",
          durAdd: 20000,
          durMult: 10000,
          delayMult: 5000,
          health: 200,
          soundKill : "http://vatelier.net/MyDemo/WebVRDefender/public/assets/sounds/Zombie_In_Pain-SoundBible.com-134322253.mp3",
          number : 3
        }};
        // NB: number and health is now overwritten by the game dynamics component
      },
      removeEnemys: function(){
        document.querySelectorAll("[wvrtd-enemy]").forEach(function(enemy){enemy.parentNode.removeChild(enemy);});
      },
      loadMonsters: function(enemys){
        this.removeEnemys();

        for (var i=0; i < enemys.length; i++){
          var enemyType = this.enemyTypes[enemys[i].type]

          for (var j=0; j< enemys[i].number; j++){
            var enemy = document.createElement("a-entity");

            enemy.setAttribute("wvrtd-enemy", {
              type        : enemys[i].type,
              startPos    : enemyType.startPos,
              rotation    : enemyType.rotation,
              dur         : enemyType.durAdd + Math.random() * enemyType.durMult,
              delay       : Math.random() * enemyType.delayMult,
              health      : enemys[i].health,
              soundKill   : enemyType.soundKill
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
