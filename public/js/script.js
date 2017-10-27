(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* global AFRAME */
(function(){
  "use strict";

  AFRAME.registerComponent("wvrtd-assign-slot", {
    schema: {
      slotID: { type: "string", default: "" }
    },
    init: function() {
      this.data.slotID = this.getUnusedSlot();
      this.el.setAttribute("position", document.getElementById(this.data.slotID).getAttribute("position"));
      this.el.setAttribute("rotation", document.getElementById(this.data.slotID).getAttribute("rotation"));
      console.log("Slot assigned:", this.data.slotID);
    },
    /**
    * Check list of slots against already used one
    * @return {int} returns first free slot
    */
    getUnusedSlot : function(){
      let gameClient = document.querySelector("[wvrtd-game-client]").components["wvrtd-game-client"];
      let slots = document.querySelector("[wvrtd-slot-threedof]").children;
      let slotID = undefined;
      for(let i = 0;i < slots.length; ++i){
        let isTaken = false;
        for(let clientID in gameClient.gameState.clients){
          if(gameClient.gameState.clients.hasOwnProperty(clientID)){
            let aClient = gameClient.gameState.clients[clientID];
            if(aClient.slotID === slots[i].id){
              isTaken = true;
              break;
            }
          }
        }
        if(!isTaken){
          slotID = slots[i].id;
          break;
        }
      }

      if(slotID){
        gameClient.clientState.slotID = slotID;
        gameClient.sendClientStateToServer();
      }
      return slotID;
    }
  });

})();

},{}],2:[function(require,module,exports){
/* global AFRAME */
(function(){
  "use strict";

  AFRAME.registerComponent("wvrtd-cursor-aim", {
    schema: {
      radiusInner: { type: "number", default: 0.1 },
      radiusOuter: { type: "number", default: 0.15 },
      color: { type: "string", default: "black" },
      position: { type: "string", default: "0 0 0" },
      rotation: { type: "string", default: "0 0 0" },
      enemyHit  : {type: "array", default: []},
    },
    init: function() {
      var cursor = document.createElement("a-ring");
      cursor.setAttribute("cursor", "");
      cursor.setAttribute("position", this.data.position);
      cursor.setAttribute("rotation", this.data.rotation);
      cursor.setAttribute("radius-inner", this.data.radiusInner);
      cursor.setAttribute("radius-outer", this.data.radiusOuter);
      cursor.setAttribute("color", this.data.color);
      this.el.appendChild(cursor);

      var enemyHitClasses = "." + this.data.enemyHit.join(" .");
      this.el.setAttribute("raycaster", {objects: enemyHitClasses });
      this.el.addEventListener("mouseenter", this.onMouseEnter.bind(this));

      this.currentTarget = undefined;
    },
    onMouseEnter: function(data){
      var containsClass= false;
      for(var i = 0; i < this.data.enemyHit.length; ++i){
        if(data.detail.intersectedEl.classList.contains(this.data.enemyHit[i])){
          containsClass = true;
          break;
        }
      }
      if(containsClass && data.detail.intersectedEl.hasStarted){
        this.el.querySelector("[cursor]").setAttribute("material", {color:"red"});
        this.currentTarget = data.detail.intersectedEl;
      }
      else{
        this.el.querySelector("[cursor]").setAttribute("material", {color:"black"});
        this.currentTarget = null;
      }
    }
  });
})();

},{}],3:[function(require,module,exports){
/* global AFRAME */
(function(){
  "use strict";

  AFRAME.registerComponent("wvrtd-enemy", {
    schema:{
      type        : {type: "string", default: "Monster"},
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

      this.enemyElt = document.querySelector("#poolEnemy" + this.data.type).components["pool__enemy" + this.data.type.toLowerCase()].requestEntity();
      this.enemyElt.classList.add("enemy" + this.data.type);

      this.el.appendChild(this.enemyElt);

      // this.el.id = "naf-" + this.el.components["networked"].data.networkId;

      this.el.setAttribute("cursor-listener", "");

      this.el.setAttribute("wvrtd-life-bar", {life : this.data.health, height : 1.5, radius : 0.2});

      this.el.setAttribute("position", this.data.startPos);

      this.el.setAttribute("alongpath", "rotate:true ; curve: #"+this.data.type+"-track; delay:" + this.data.delay + "; dur:"+this.data.dur+";");
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
      type        : {type: "string", default: "Monster"},
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
        "Monster": {
          startPos: "-1.525 0.24 30.255",
          rotation : "0 180 0",
          durAdd: 20000,
          durMult: 10000,
          delayMult: 5000,
          health: 100,
          soundKill : "http://vatelier.net/MyDemo/WebVRDefender/public/assets/sounds/Zombie_In_Pain-SoundBible.com-134322253.mp3",
          number : 2
        },
        "Dragon" : {
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
        var gameClient = document.querySelector("[wvrtd-game-client]").components["wvrtd-game-client"];
        if(gameClient.mainClient){
          gameClient.sendEnemyCreation(enemys);
        }

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
        var gameClient = document.querySelector("[wvrtd-game-client]").components["wvrtd-game-client"];
        if(gameClient.mainClient){
          gameClient.broadcastToRoom("onEnemyStarted");
        }

        var enemys = this.el.querySelectorAll("[wvrtd-enemy]");
        for(let i = 0; i < enemys.length; ++i){
          enemys[i].components["wvrtd-enemy"].start();
        }
      }
    });

  })();

},{}],4:[function(require,module,exports){
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
            {type : "Monster", number : 5, health : 100},
          ],
          timeout: 10000
        },
        "wave2" : {
          enemys : [
            {type : "Monster", number : 5, health : 100},
            {type : "Dragon", number : 3, health : 200},
          ],
          timeout: 10000
        },
        "wave3" : {
          enemys : [
            {type : "Monster", number : 8, health : 100},
            {type : "Dragon", number : 5, health : 200},
          ],
          timeout: 10000
        },
        "wave4" : {
          enemys : [
            {type : "Monster", number : 10, health : 100},
            {type : "Dragon", number : 4, health : 200},
          ],
          timeout: 10000
        }
      }

      this.currentWave = 0;
      this.maxWave = 5;

      this.el.addEventListener("enemy-finished", this.onEnemyFinished.bind(this));
      this.el.addEventListener("goal-destroyed", this.onGoalDestroyed.bind(this));
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
    onGoalDestroyed: function(){
      this.wavesFinished();
      this.currentWave = this.maxWave;
    },
    wavesFinished: function(){
      console.log("====GAME FINISHED====");
      NAF.connection.broadcastDataGuaranteed("gameFinished", {type : "broadcast"});
    }
  });

})();

},{}],5:[function(require,module,exports){
/* global AFRAME, NAF */
// Use of this source code is governed by an Apache license that can be
// found in the LICENSE file.
(function(){
  "use strict";

  /**
  * Handle discussions with the server and Game State
  * @return {[type]}                   [description]
  */
  AFRAME.registerComponent("wvrtd-game-client", {
    init: function() {
      //General game state with informations about all clients
      this.gameState = undefined;
      this.serverConnected = false;
      this.mainClient = false;

      this.clientState = {
        ID     : 0,
        type   : undefined
      };
    },
    setDevice: function(deviceType){
      this.clientState.type = deviceType;
      this.initPlayer();
    },
    /**
    * Init the client, called when connected to the server
    * @return {[type]} [description]
    */
    initClient : function(params){
      this.roomName = params.roomName;
      this.socket = io();

      this.registerEvents();
    },
    broadcastToRoom: function(evtName){
      this.socket.emit("broadcastToRoom", {roomName : this.roomName, client: this.clientState, evtName: evtName});
    },
    registerEvents: function(){
      window.onbeforeunload = this.onDisconnect.bind(this);

      this.socket.on("onConnect", this.onConnect.bind(this));
      this.socket.on("onError", this.onError.bind(this));
      this.socket.on("onRoomEntered", this.onRoomEntered.bind(this));
      this.socket.on("onGameStateUpdate", this.onGameStateUpdate.bind(this));
    },
    onConnect: function(data){
      console.log("Client connected with ID="+data.clientID);
      this.clientState.ID = data.clientID;
      this.socket.emit("logInRoom", {roomName : this.roomName, client: this.clientState});
    },
    /**
    * Event called on window.onbeforeunload when client disconnects
    * @return {[type]} [description]
    */
    onDisconnect : function(){
      this.socket.emit("clientDisconnected", {roomName : this.roomName, clientID: this.clientState.ID});
    },
    onError: function(data){
      console.log("[SERVER ERROR]", data.error);
    },
    onRoomEntered: function(data){
      this.mainClient = data.isMainClient;
      this.gameState = data.gameState;
      console.log("Client " + this.clientState.ID + " entered room " + data.gameState.name + (this.mainClient ? " and is Main client" : ""));
      this.initialSetup();
    },
    onGameStateUpdate: function(data){
      this.gameState = data;
      console.log("[WVRTD-Game-Client]", "Gamestate received", this.gameState);
      if(!document.querySelector("#playersListCard").classList.contains("hide")){
        WVRTD.gameLaunchUI.updatePlayerList(this.gameState);
      }
    },
    /**
    * Send game state to server when updated
    * @return {[type]} [description]
    */
    sendClientStateToServer : function(){
      this.socket.emit("clientStateUpdated", {roomName : this.roomName, client: this.clientState});
    },
    /**
    * Init player entity by checking its type
    * @return {[type]} [description]
    */
    initialSetup : function(){
      if(!this.mainClient){
        //Otherwise, he'll be looking for enemy entities to be created
        document.body.addEventListener('entityCreated', this.onNAFEntityCreated.bind(this));
        WVRTD.gameLaunchUI.removeLaunchGame();
        this.socket.on("onGameLaunched", this.onGameLaunched.bind(this));
        this.socket.on("onEnemyCreation", this.onEnemyCreation.bind(this));
        this.socket.on("onEnemyStarted", this.onEnemyStarted.bind(this));
        this.socket.on("gameFinished", this.onGameFinished.bind(this));
      }

      this.socket.on("enemyHitNetwork", this.onEnemyHitNetwork.bind(this));
    },
    launchGame: function(){
      this.broadcastToRoom("onGameLaunched");
      WVRTD.gameLaunchUI.hideIntroUI();
      document.querySelector("#windSound").components["sound"].playSound();

      document.querySelector("[wvrtd-enemy-wave]").components["wvrtd-enemy-wave"].launchWave(1, 10000);
    },
    onGameLaunched : function(senderID, msg, data){
      WVRTD.gameLaunchUI.hideIntroUI();
      document.querySelector("#windSound").components["sound"].playSound();
    },
    onEnemyStarted : function(senderID, msg, data){
      document.querySelector("[wvrtd-enemy-pool]").components["wvrtd-enemy-pool"].start();
    },
    sendEnemyCreation : function(enemys){
      this.socket.emit("enemyCreation", {roomName : this.roomName, client: this.clientState, enemys: enemys});
    },
    onEnemyCreation : function(data){
      document.querySelector("[wvrtd-enemy-pool]").components["wvrtd-enemy-pool"].loadMonsters(data.enemys);
    },
    onEnemyStarted: function(){
      document.querySelectorAll("[class^=enemy]").forEach(function(enemyElt){
        enemyElt.hasStarted = true;
      })
    },
    onGameFinished: function(){
      console.log("====GAME FINISHED====");
    },
    initPlayer: function(){
      let player = document.createElement("a-entity");
      player.id = "player"+Math.floor(Math.random()*50);

      switch(this.clientState.type){
        case WVRTD.devDet.deviceType.GEARVR:
        case WVRTD.devDet.deviceType.MOBILE:
          player.setAttribute("wvrtd-player-threedof", {});
          break;
        case WVRTD.devDet.deviceType.DESKTOP:
          player.setAttribute("wvrtd-player-desktop", {});
          break;
        case WVRTD.devDet.deviceType.VIVE:
        case WVRTD.devDet.deviceType.RIFT:
        case WVRTD.devDet.deviceType.WINDOWSMR:
          player.setAttribute("wvrtd-player-sixdof", {});
          break;
      }

      document.querySelector("a-scene").appendChild(player);
    },
    /**
     * Listener for NAF entities to be created
     * @param  {Object} entity aframe entity received through network
     * @return {[type]}        [description]
     */
    onNAFEntityCreated : function(entity){
      if(entity.detail.el.components["networked"].data.template.indexOf("#enemy") !== -1){
        entity.detail.el.setAttribute("wvrtd-enemy-network", "");
      }
    },
    /**
     * Listener for enemy hit via an other player
     * @param  {[type]} senderID [description]
     * @param  {[type]} msg      [description]
     * @param  {[type]} data     [description]
     * @return {[type]}          [description]
     */
    onEnemyHitNetwork : function(senderID, msg, data){
      if(!document.querySelector("#"+data.enemyID)){
        return;
      }
      //Retrieve the enemy entity based on its ID, depending if user is game master or not
      let enemy = document.querySelector("#"+data.enemyID).components["wvrtd-enemy"] || document.querySelector("#"+data.enemyID).components["wvrtd-enemy-network"];
      enemy.onHit({hitPoints: data.hitPoints});
    }
  });

})();

},{}],6:[function(require,module,exports){
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

      // NAF.connection.subscribeToDataChannel("goalHitNetwork", this.onGoalHitNetwork.bind(this));

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

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
/* global AFRAME */
(function(){
  "use strict";

  // internals
  var EPS = 0.000001;
  var panStart = new THREE.Vector3();
  var panMove = new THREE.Vector3();
  var panDelta = new THREE.Vector3();
  var STATE = { NONE : -1, ROTATE : 0, DOLLY : 1, PAN : 2 };
  var state = STATE.NONE;

  AFRAME.registerComponent("wvrtd-lookdown-controls", {
    init: function() {
      this.object = this.el.object3D;
      this.zoomSpeed = 0.005;
      this.minDistance = 0;
      this.maxDistance = Infinity;
      this.scalarPan = 5;

      this.domElement = document;

      this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
      this.domElement.addEventListener( 'mousedown', this.onMouseDown.bind(this), false );
      this.domElement.addEventListener( 'mousewheel', this.onMouseWheel.bind(this), false );

      document.body.style.cursor = "-webkit-grab";
    },
    onMouseDown: function( event ) {
      if ( this.enabled === false ) { return; }
      event.preventDefault();

      if ( event.button === 0 ) {
        state = STATE.PAN;

        panStart.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        panStart.z = -( event.clientY / window.innerHeight ) * 2 + 1;
      }
      this.domElement.addEventListener( 'mousemove', this.onMouseMove.bind(this), false );
      this.domElement.addEventListener( 'mouseup', this.onMouseUp.bind(this), false );

      document.body.classList.add('a-grabbing');
    },
    onMouseMove: function( event ) {
      if ( this.enabled === false ) return;

      event.preventDefault();

      if ( state === STATE.PAN ) {
        panMove.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        panMove.z = -( event.clientY / window.innerHeight ) * 2 + 1;

        panDelta.subVectors(panStart, panMove);
        panDelta.multiplyScalar(this.scalarPan);
        panDelta.z *= -1;
        panDelta.add(this.object.position);

        this.el.setAttribute("position", AFRAME.utils.coordinates.stringify(panDelta));

        panStart.copy(panMove);
      }
    },
    onMouseUp: function( /* event */ ) {
      if ( this.enabled === false ) return;

      this.domElement.removeEventListener( 'mousemove', this.onMouseMove.bind(this), false );
      this.domElement.removeEventListener( 'mouseup', this.onMouseUp.bind(this), false );
      state = STATE.NONE;
      document.body.classList.remove('a-grabbing');
    },
    onMouseWheel: function( event ) {
      if ( this.enabled === false ) return;
      var delta = 0;

      if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9
        delta = event.wheelDelta;
      } else if ( event.detail ) { // Firefox
        delta = - event.detail;
      }

      panDelta.copy(this.object.position);
      panDelta.y += ( delta * -this.zoomSpeed );
      this.el.setAttribute("position", AFRAME.utils.coordinates.stringify(panDelta));
    }
  });
})();

},{}],9:[function(require,module,exports){
/* global AFRAME */
(function(){
  "use strict";

  var DOWN_VECTOR = new THREE.Vector3(0, -1, 0);

  AFRAME.registerComponent("wvrtd-player-desktop", {
    dependencies: ['wvrtd-lookdown-controls'],
    schema:{
      hitPoints  : {type: "number", default: 50},
      enemyHit  : {type: "array", default: ["enemyMonster"]},
    },
    init: function() {
      var that = this;
      this.el.setAttribute("mixin", "panda");

      this.el.setAttribute("position", "3 10 2");
      var camera = document.createElement("a-camera");
      camera.setAttribute("user-height", 0);
      camera.setAttribute("look-controls-enabled", false);
      camera.setAttribute("rotation", "-90 0 0");
      this.el.appendChild(camera);

      this.el.setAttribute("wvrtd-lookdown-controls", {});


      this.el.setAttribute("wvrtd-cursor-aim", {
        position : "0 -3 0",
        rotation : "-90 0 0",
        radiusInner : 0.1,
        radiusOuter : 0.15,
        color : "black",
        enemyHit : this.data.enemyHit
      });
      document.addEventListener("keyup", this.onKeyUp.bind(this));
    },
    onKeyUp: function(event){
      var cursorAim = this.el.components["wvrtd-cursor-aim"];

      var key = event.keyCode ? event.keyCode : event.which;
      if (key == 32 && cursorAim.currentTarget) {
        cursorAim.currentTarget.emit("hit", {hitPoints: this.data.hitPoints, origin: this.el});
      }
    }
  });

})();

},{}],10:[function(require,module,exports){
/* global AFRAME */
(function(){
  "use strict";

  AFRAME.registerComponent("wvrtd-player-sixdof", {
    schema:{
      hitPoints  : {type: "number", default: 50},
      enemyHit  : {type: "array", default: ["enemyMonster"]},
      handDisabledTime: {type: "number", default: 1000}
    },
    init: function() {
      this.el.setAttribute("mixin", "giant-head");


      this.el.setAttribute("position", "-1 1.4 7");
      this.el.setAttribute("rotation", "0 180 0");
      var camera = document.createElement("a-camera");
      camera.setAttribute("user-height", 0);
      this.el.appendChild(camera);

      this.leftHand = document.createElement("a-entity");
      this.leftHand.id = "leftHand" + (Math.floor(Math.random() * 100));
      this.leftHand.setAttribute("networked", {
        template          : "#giant-hand-left-template",
        showLocalTemplate : true
      });
      this.leftHand.setAttribute("windows-motion-controls", {hand : "left", model: false});
      this.el.appendChild(this.leftHand);

      this.rightHand = document.createElement("a-entity");
      this.rightHand.id = "rightHand" + (Math.floor(Math.random() * 100));
      this.rightHand.setAttribute("networked", {
        template          : "#giant-hand-right-template",
        showLocalTemplate : true
      });
      this.rightHand.setAttribute("windows-motion-controls", {hand : "right", model: false});
      this.el.appendChild(this.rightHand);
    },
    disableHand: function(hand){
      hand.disabled = true;
      setTimeout(function(){
        hand.disabled = false;
      }, this.data.handDisabledTime);
    },
    tick: function(){
      var leftHandPos = this.leftHand.object3D.getWorldPosition();
      var rightHandPos = this.rightHand.object3D.getWorldPosition();
      this.collideElements = document.querySelectorAll("." + this.data.enemyHit);
      for(var i =0; i < this.collideElements.length; ++i){
        var posElt = this.collideElements[i].object3D.getWorldPosition();
        if(!this.rightHand.disabled && rightHandPos.distanceTo(posElt) < 1){
          this.collideElements[i].emit("hit", {hitPoints: this.data.hitPoints, origin: this.el});
          this.disableHand(this.rightHand);
        }
        else if(!this.leftHand.disabled && leftHandPos.distanceTo(posElt) < 1){
          this.collideElements[i].emit("hit", {hitPoints: this.data.hitPoints, origin: this.el});
          this.disableHand(this.leftHand);
        }
      }
    }
  });

})();

},{}],11:[function(require,module,exports){
/* global AFRAME */
(function(){
  "use strict";

  AFRAME.registerComponent("wvrtd-player-threedof", {
    schema:{
      hitPoints  : {type: "number", default: 50},
      enemyHit  : {type: "array", default: ["enemyMonster", "enemyDragon"]},
    },
    init: function() {
      var that = this;

      this.gamepadState = undefined;
      if(AFRAME.utils.device.isGearVR()){
        var GamepadState = require("../../lib/gamepadState.js");
        // See GamepadState.js, this is a simple wrapper around the navigator.getGamepads API with Gear VR input detection
        this.gamepadState = new GamepadState();
        // When the gamepadState is updated it will use this callback to trigger any detected Gear VR actions
        this.gamepadState.ongearvrinput = function (gearVRAction) {
          that.onClick();
        };
      }

      this.el.setAttribute("mixin", "tower");

      this.el.setAttribute("wvrtd-assign-slot", {});
      this.el.setAttribute("camera", {});
      this.el.setAttribute("look-controls", {});

      this.el.setAttribute("wvrtd-cursor-aim", {
        position : "0 0 -3",
        radiusInner : 0.1,
        radiusOuter : 0.15,
        color : "black",
        enemyHit : this.data.enemyHit
      });

      document.querySelector("canvas").addEventListener("click", this.onClick.bind(this));
      document.querySelector("canvas").addEventListener("touch", this.onClick.bind(this));
    },
    onClick: function(event){
      var cursorAim = this.el.components["wvrtd-cursor-aim"];
      if(!cursorAim.currentTarget){
        return;
      }

      cursorAim.currentTarget.emit("hit", {hitPoints: this.data.hitPoints, origin: this.el});
      cursorAim.currentTarget = undefined;
    },
    tick: function(){
      if(this.gamepadState){
        this.gamepadState.update();
      }
    }
  });
})();

},{"../../lib/gamepadState.js":17}],12:[function(require,module,exports){
var DevDet = {};

(function(){
    "use strict";

//AFrame device utils
var AFDevice = AFRAME.utils.device;

//vr device enum setup
function Enum(values){
    for( var i = 0; i < values.length; ++i ){
        this[values[i]] = i;
    }
    return this;
}
DevDet.deviceType = new Enum(['GEARVR', 'MOBILE', 'DESKTOP', 'VIVE', 'RIFT', 'WINDOWSMR', 'UNKNOWN']);

//detected device
DevDet.detectedDevice = null;
DevDet.displayDevice = null;

//device detection
DevDet.detectDevice = new Promise(function(resolve, reject){
  try{
    navigator.getVRDisplays().then(function (displays) {
      console.log("[DevDet devices]", displays[0]);

      DevDet.displayDevice = displays[0];

      if(AFDevice.isGearVR()){
        DevDet.detectedDevice = DevDet.deviceType.GEARVR;
      }
      else if(AFDevice.isMobile()){
        DevDet.detectedDevice = DevDet.deviceType.MOBILE;
      }
      else if (displays.length > 0){ //trys to match high end headsets
        switch (displays[0].displayName) {
          case 'Oculus VR HMD':
            DevDet.detectedDevice = DevDet.deviceType.RIFT;
            break;
          case 'OpenVR HMD':
            DevDet.detectedDevice = DevDet.deviceType.VIVE;
            break;
          case 'HTC Vive MV':
            DevDet.detectedDevice = DevDet.deviceType.VIVE;
            break;
          case 'Acer AH100':
            DevDet.detectedDevice = DevDet.deviceType.WINDOWSMR;
            break;
          default: //undetected
            console.log('undetected device name: ' + displays[0].displayName);
            break;
        }
      }
      else if(displays.length === 0){
        DevDet.detectedDevice = DevDet.deviceType.DESKTOP;
        DevDet.displayDevice = {displayName: "desktop"};
      }
      else {
        DevDet.detectedDevice = DevDet.deviceType.UNKNOWN;
      }
      resolve(DevDet);
    });
  }
  catch(err){
    reject(err);
  }
});

})();

module.exports = DevDet;

},{}],13:[function(require,module,exports){
var GameLaunchUI;

(function(){
  "use strict";

  var DevDet = require("./devDet.js");

  GameLaunchUI = function(){
    //Fetch the room name in the URL or puts you in room42
    this.roomName = AFRAME.utils.getUrlParameter("room");
    if(!this.roomName){
      this.initGameChoice();
    }
    else{
      document.querySelector("#welcomeCard").classList.add("hide");
      document.querySelector("#gameModeCard").classList.remove("hide");
      (document.querySelector("a-scene").hasLoaded ? this.onSceneLoaded() : document.querySelector("a-scene").addEventListener("loaded", this.onSceneLoaded.bind(this)));
    }
  };

  GameLaunchUI.prototype.initGameChoice = function(){
    document.body.removeChild(document.querySelector("a-scene"));
    document.querySelector("#welcomeCard").classList.remove("hide");

    function onGameChoiceClick(type){
      document.querySelector("#roomBtnDiv").classList.add("hide");
      document.querySelector("#roomInputBtn").classList.remove("hide");

      document.querySelector("#roomChoiceGo").addEventListener("click", function(){
        var roomName = document.querySelector("#room_name").value;
        if (roomName.length == 0){
          // if the user tries to enter a room without a name, generate one
          roomName = "RandomRoom"+parseInt( Math.random()*10000 )
        }
        location.href = location.origin + location.pathname + "?room=" + roomName
      });
    }
    document.querySelector("#createGameBtn").addEventListener("click", onGameChoiceClick);
    document.querySelector("#joinGameBtn").addEventListener("click", onGameChoiceClick);
  };

  GameLaunchUI.prototype.onSceneLoaded = function(){
    var that = this;

    //Device Detection
    DevDet.detectDevice.then(function(data){
      WVRTD.devDet = data;
      that.displayDeviceUI();

      document.querySelector("[wvrtd-game-client]").components["wvrtd-game-client"].initClient({roomName: that.roomName});

      document.getElementById("loaderDiv").classList.remove("make-container--visible");
      WVRTD.loaded = true;
    });
  };

  GameLaunchUI.prototype.displayDeviceUI = function(){
    var that = this;
    var gameModeChoiceDiv = document.querySelector("#gameModeChoiceDiv");
    function createBtn(id, name, aDeviceType){
      var btn = document.createElement("a");
      btn.id = id;
      btn.classList.add("waves-effect");
      btn.classList.add("waves-light");
      btn.classList.add("btn");
      btn.innerHTML = name;
      gameModeChoiceDiv.appendChild(btn);

      var deviceType = aDeviceType;
      btn.addEventListener("click", function(){
        that.onGameChoiceMade(deviceType);
      });
    }

    switch(WVRTD.devDet.detectedDevice){
      case WVRTD.devDet.deviceType.GEARVR:
      case WVRTD.devDet.deviceType.MOBILE:
        createBtn("gameChoiceVR", "VR MODE", WVRTD.devDet.deviceType.GEARVR);
        createBtn("gameChoiceMW", "MAGIC WINDOW MODE", WVRTD.devDet.deviceType.MOBILE);
        break;
      case WVRTD.devDet.deviceType.VIVE:
      case WVRTD.devDet.deviceType.RIFT:
      case WVRTD.devDet.deviceType.WINDOWSMR:
        createBtn("gameChoiceVR", "VR MODE", WVRTD.devDet.deviceType.RIFT);
        createBtn("gameChoiceMW", "DESKTOP MODE", WVRTD.devDet.deviceType.DESKTOP);
        break;
      case WVRTD.devDet.deviceType.DESKTOP:
        createBtn("gameChoiceMW", "DESKTOP MODE", WVRTD.devDet.deviceType.DESKTOP);
        break;
    }
  };

  GameLaunchUI.prototype.onGameChoiceMade = function(deviceType){
    document.querySelector("[wvrtd-game-client]").components["wvrtd-game-client"].setDevice(deviceType);
    document.querySelector("#gameModeCard").classList.add("hide");
    document.querySelector("#playersListCard").classList.remove("hide");
    document.querySelector("#roomJoinIncentive").innerHTML += location.href;

    if(document.querySelector("[wvrtd-game-client]").components["wvrtd-game-client"].gameState){
      this.updatePlayerList(document.querySelector("[wvrtd-game-client]").components["wvrtd-game-client"].gameState);
    }

    if(document.querySelector("#launchGame")){
      document.querySelector("#launchGame").addEventListener("click", function(){
        document.querySelector("[wvrtd-game-client]").components["wvrtd-game-client"].launchGame();
      })
    }
  };

  GameLaunchUI.prototype.updatePlayerList = function(gameState){
    var nbPlayers = 0;
    for(var key in gameState.clients){
      if(gameState.clients.hasOwnProperty(key)){
        nbPlayers++;
      }
    }
    document.querySelector("#nbPlayersSpan").innerHTML = nbPlayers;
  };

  GameLaunchUI.prototype.removeLaunchGame = function(){
    if(document.querySelector("#launchGame")){
      document.querySelector("#playersListCard").removeChild(document.querySelector("#launchGame"));
    }

    var spanWait = document.createElement("span");
    spanWait.id = "spanWait";
    spanWait.classList.add("card-title");
    spanWait.innerHTML = "Waiting for game master to launch game...";
    document.querySelector("#playersListCard").appendChild(spanWait);
  };

  GameLaunchUI.prototype.hideIntroUI = function(){
    var clientType = document.querySelector("[wvrtd-game-client]").components["wvrtd-game-client"].clientState.type;
    if(clientType !== WVRTD.devDet.deviceType.MOBILE && clientType !== WVRTD.devDet.deviceType.DESKTOP){
      document.querySelector("#playersListCard").classList.add("hide");
      document.querySelector("#enterVRCard").classList.remove("hide");

      document.querySelector("#enterVRCard").addEventListener("click", function(){
        document.querySelector("a-scene").enterVR();
        document.querySelector("#introContainer").classList.add("hide");
      })
    }
    else{
      document.querySelector("#introContainer").classList.add("hide");
    }
  };
})();

module.exports = GameLaunchUI;

},{"./devDet.js":12}],14:[function(require,module,exports){
/* global AFRAME */
// Use of this source code is governed by an Apache license that can be
// found in the LICENSE file.
window.WVRTD = {};
(function(){
  "use strict";

  require("./components/assign_slot.js");
  require("./components/lookdown-controls.js");
  require("./components/cursor_aim.js");
  require("./components/player_threedof.js");
  require("./components/player_sixdof.js");
  require("./components/player_desktop.js");
  require("./components/life_bar.js");
  require("./components/enemy.js");
  require("./components/gameClient.js");
  require("./components/goal.js");
  require("./components/enemy_wave.js");
  require("../lib/aframe-animation-component.min.js");
  require("../lib/aframe-curve-component.min.js");
  var GameLaunchUI = require("./gameLaunchUI.js");

  window.onload = function(){
    WVRTD.gameLaunchUI = new GameLaunchUI();
  };
})();

},{"../lib/aframe-animation-component.min.js":15,"../lib/aframe-curve-component.min.js":16,"./components/assign_slot.js":1,"./components/cursor_aim.js":2,"./components/enemy.js":3,"./components/enemy_wave.js":4,"./components/gameClient.js":5,"./components/goal.js":6,"./components/life_bar.js":7,"./components/lookdown-controls.js":8,"./components/player_desktop.js":9,"./components/player_sixdof.js":10,"./components/player_threedof.js":11,"./gameLaunchUI.js":13}],15:[function(require,module,exports){
!function(t){function n(r){if(e[r])return e[r].exports;var a=e[r]={exports:{},id:r,loaded:!1};return t[r].call(a.exports,a,a.exports,n),a.loaded=!0,a.exports}var e={};return n.m=t,n.c=e,n.p="",n(0)}([function(t,n,e){function r(t,n,e){var r=n.from||s(t,n.property);return AFRAME.utils.extend({},e,{targets:[{aframeProperty:r}],aframeProperty:n.to,update:function(){c(t,n.property,this.targets[0].aframeProperty)}})}function a(t,n,e){var r=s(t,n.property);n.from&&(r=AFRAME.utils.coordinates.parse(n.from));var a=AFRAME.utils.coordinates.parse(n.to);return AFRAME.utils.extend({},e,{targets:[r],update:function(){c(t,n.property,this.targets[0])}},a)}function i(t,n){var e=n.split("."),r=e[0],a=e[1],i=t.components[r]||AFRAME.components[r];return i?a?i.schema[a].type:i.schema.type:null}var o=e(1);if("undefined"==typeof AFRAME)throw new Error("Component attempted to register before AFRAME was available.");var u=AFRAME.utils,s=u.entity.getComponentProperty,c=u.entity.setComponentProperty;u.styleParser.parse;AFRAME.registerComponent("animation",{schema:{delay:{default:0},dir:{default:""},dur:{default:1e3},easing:{default:"easeInQuad"},elasticity:{default:400},from:{default:""},loop:{default:!1},property:{default:""},repeat:{default:0},startEvents:{type:"array"},pauseEvents:{type:"array"},resumeEvents:{type:"array"},restartEvents:{type:"array"},to:{default:""}},multiple:!0,init:function(){this.animation=null,this.animationIsPlaying=!1,this.config=null,this.playAnimationBound=this.playAnimation.bind(this),this.pauseAnimationBound=this.pauseAnimation.bind(this),this.resumeAnimationBound=this.resumeAnimation.bind(this),this.restartAnimationBound=this.restartAnimation.bind(this),this.repeat=0},update:function(){var t=this.attrName,n=this.data,e=this.el,u=i(e,n.property),s=this;if(n.property){this.repeat=n.repeat;var c={autoplay:!1,begin:function(){e.emit("animationbegin"),e.emit(t+"-begin")},complete:function(){e.emit("animationcomplete"),e.emit(t+"-complete"),--s.repeat>0&&s.animation.play()},direction:n.dir,duration:n.dur,easing:n.easing,elasticity:n.elasticity,loop:n.loop},f=r;"vec2"!==u&&"vec3"!==u&&"vec4"!==u||(f=a),this.config=f(e,n,c),this.animation=o(this.config),this.pauseAnimation(),this.data.startEvents.length||(this.animationIsPlaying=!0),this.removeEventListeners(),this.addEventListeners()}},remove:function(){this.pauseAnimation(),this.removeEventListeners()},pause:function(){this.pauseAnimation(),this.removeEventListeners()},play:function(){function t(){e.playAnimation(),e.addEventListeners()}var n=this.data,e=this;this.animation&&this.animationIsPlaying&&(n.delay?setTimeout(t,n.delay):t())},addEventListeners:function(){var t=this,n=this.data,e=this.el;n.startEvents.map(function(n){e.addEventListener(n,t.playAnimationBound)}),n.pauseEvents.map(function(n){e.addEventListener(n,t.pauseAnimationBound)}),n.resumeEvents.map(function(n){e.addEventListener(n,t.resumeAnimationBound)}),n.restartEvents.map(function(n){e.addEventListener(n,t.restartAnimationBound)})},removeEventListeners:function(){var t=this,n=this.data,e=this.el;n.startEvents.map(function(n){e.removeEventListener(n,t.playAnimationBound)}),n.pauseEvents.map(function(n){e.removeEventListener(n,t.pauseAnimationBound)}),n.resumeEvents.map(function(n){e.removeEventListener(n,t.resumeAnimationBound)}),n.restartEvents.map(function(n){e.removeEventListener(n,t.restartAnimationBound)})},playAnimation:function(){this.animation=o(this.config),this.animation.play()},pauseAnimation:function(){this.animation.pause()},resumeAnimation:function(){this.animation.play()},restartAnimation:function(){this.animation.restart()}})},function(t,n,e){var r,a,i;!function(e,o){a=[],r=o,i="function"==typeof r?r.apply(n,a):r,!(void 0!==i&&(t.exports=i))}(this,function(){var t,n="1.1.3",e={duration:1e3,delay:0,loop:!1,autoplay:!0,direction:"normal",easing:"easeOutElastic",elasticity:400,round:!1,begin:void 0,update:void 0,complete:void 0},r=["translateX","translateY","translateZ","rotate","rotateX","rotateY","rotateZ","scale","scaleX","scaleY","scaleZ","skewX","skewY"],a="transform",i={arr:function(t){return Array.isArray(t)},obj:function(t){return Object.prototype.toString.call(t).indexOf("Object")>-1},svg:function(t){return t instanceof SVGElement},dom:function(t){return t.nodeType||i.svg(t)},num:function(t){return!isNaN(parseInt(t))},str:function(t){return"string"==typeof t},fnc:function(t){return"function"==typeof t},und:function(t){return"undefined"==typeof t},nul:function(t){return"null"==typeof t},hex:function(t){return/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(t)},rgb:function(t){return/^rgb/.test(t)},hsl:function(t){return/^hsl/.test(t)},col:function(t){return i.hex(t)||i.rgb(t)||i.hsl(t)}},o=function(){var t={},n=["Quad","Cubic","Quart","Quint","Expo"],e={Sine:function(t){return 1+Math.sin(Math.PI/2*t-Math.PI/2)},Circ:function(t){return 1-Math.sqrt(1-t*t)},Elastic:function(t,n){if(0===t||1===t)return t;var e=1-Math.min(n,998)/1e3,r=t/1,a=r-1,i=e/(2*Math.PI)*Math.asin(1);return-(Math.pow(2,10*a)*Math.sin((a-i)*(2*Math.PI)/e))},Back:function(t){return t*t*(3*t-2)},Bounce:function(t){for(var n,e=4;t<((n=Math.pow(2,--e))-1)/11;);return 1/Math.pow(4,3-e)-7.5625*Math.pow((3*n-2)/22-t,2)}};return n.forEach(function(t,n){e[t]=function(t){return Math.pow(t,n+2)}}),Object.keys(e).forEach(function(n){var r=e[n];t["easeIn"+n]=r,t["easeOut"+n]=function(t,n){return 1-r(1-t,n)},t["easeInOut"+n]=function(t,n){return t<.5?r(2*t,n)/2:1-r(t*-2+2,n)/2},t["easeOutIn"+n]=function(t,n){return t<.5?(1-r(1-2*t,n))/2:(r(2*t-1,n)+1)/2}}),t.linear=function(t){return t},t}(),u=function(t){return i.str(t)?t:t+""},s=function(t){return t.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase()},c=function(t){if(i.col(t))return!1;try{var n=document.querySelectorAll(t);return n}catch(t){return!1}},f=function(t,n){return Math.floor(Math.random()*(n-t+1))+t},l=function(t){return t.reduce(function(t,n){return t.concat(i.arr(n)?l(n):n)},[])},p=function(t){return i.arr(t)?t:(i.str(t)&&(t=c(t)||t),t instanceof NodeList||t instanceof HTMLCollection?[].slice.call(t):[t])},m=function(t,n){return t.some(function(t){return t===n})},d=function(t,n){var e={};return t.forEach(function(t){var r=JSON.stringify(n.map(function(n){return t[n]}));e[r]=e[r]||[],e[r].push(t)}),Object.keys(e).map(function(t){return e[t]})},h=function(t){return t.filter(function(t,n,e){return e.indexOf(t)===n})},v=function(t){var n={};for(var e in t)n[e]=t[e];return n},y=function(t,n){for(var e in n)t[e]=i.und(t[e])?n[e]:t[e];return t},g=function(t){var n=/^#?([a-f\d])([a-f\d])([a-f\d])$/i,t=t.replace(n,function(t,n,e,r){return n+n+e+e+r+r}),e=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t),r=parseInt(e[1],16),a=parseInt(e[2],16),i=parseInt(e[3],16);return"rgb("+r+","+a+","+i+")"},A=function(t){var n,e,r,t=/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(t),a=parseInt(t[1])/360,i=parseInt(t[2])/100,o=parseInt(t[3])/100,u=function(t,n,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?t+6*(n-t)*e:e<.5?n:e<2/3?t+(n-t)*(2/3-e)*6:t};if(0==i)n=e=r=o;else{var s=o<.5?o*(1+i):o+i-o*i,c=2*o-s;n=u(c,s,a+1/3),e=u(c,s,a),r=u(c,s,a-1/3)}return"rgb("+255*n+","+255*e+","+255*r+")"},b=function(t){return i.rgb(t)?t:i.hex(t)?g(t):i.hsl(t)?A(t):void 0},E=function(t){return/([\+\-]?[0-9|auto\.]+)(%|px|pt|em|rem|in|cm|mm|ex|pc|vw|vh|deg)?/.exec(t)[2]},M=function(t,n,e){return E(n)?n:t.indexOf("translate")>-1?E(e)?n+E(e):n+"px":t.indexOf("rotate")>-1||t.indexOf("skew")>-1?n+"deg":n},x=function(t,n){if(n in t.style)return getComputedStyle(t).getPropertyValue(s(n))||"0"},w=function(t,n){var e=n.indexOf("scale")>-1?1:0,r=t.style.transform;if(!r)return e;for(var a=/(\w+)\((.+?)\)/g,i=[],o=[],u=[];i=a.exec(r);)o.push(i[1]),u.push(i[2]);var s=u.filter(function(t,e){return o[e]===n});return s.length?s[0]:e},L=function(t,n){return i.dom(t)&&m(r,n)?"transform":i.dom(t)&&(t.getAttribute(n)||i.svg(t)&&t[n])?"attribute":i.dom(t)&&"transform"!==n&&x(t,n)?"css":i.nul(t[n])||i.und(t[n])?void 0:"object"},I=function(t,n){switch(L(t,n)){case"transform":return w(t,n);case"css":return x(t,n);case"attribute":return t.getAttribute(n)}return t[n]||0},P=function(t,n,e){if(i.col(n))return b(n);if(E(n))return n;var r=E(E(t.to)?t.to:t.from);return!r&&e&&(r=E(e)),r?n+r:n},O=function(t){var n=/-?\d*\.?\d+/g;return{original:t,numbers:u(t).match(n)?u(t).match(n).map(Number):[0],strings:u(t).split(n)}},k=function(t,n,e){return n.reduce(function(n,r,a){var r=r?r:e[a-1];return n+t[a-1]+r})},B=function(t){var t=t?l(i.arr(t)?t.map(p):p(t)):[];return t.map(function(t,n){return{target:t,id:n}})},F=function(t,n){var r=[];for(var a in t)if(!e.hasOwnProperty(a)&&"targets"!==a){var o=i.obj(t[a])?v(t[a]):{value:t[a]};o.name=a,r.push(y(o,n))}return r},j=function(t,n,e,r){var a=p(i.fnc(e)?e(t,r):e);return{from:a.length>1?a[0]:I(t,n),to:a.length>1?a[1]:a[0]}},C=function(t,n,e,r){var a={};if("transform"===e)a.from=t+"("+M(t,n.from,n.to)+")",a.to=t+"("+M(t,n.to)+")";else{var i="css"===e?x(r,t):void 0;a.from=P(n,n.from,i),a.to=P(n,n.to,i)}return{from:O(a.from),to:O(a.to)}},R=function(t,n){var e=[];return t.forEach(function(r,a){var o=r.target;return n.forEach(function(n){var u=L(o,n.name);if(u){var s=j(o,n.name,n.value,a),c=v(n);c.animatables=r,c.type=u,c.from=C(n.name,s,c.type,o).from,c.to=C(n.name,s,c.type,o).to,c.round=i.col(s.from)||c.round?1:0,c.delay=(i.fnc(c.delay)?c.delay(o,a,t.length):c.delay)/K.speed,c.duration=(i.fnc(c.duration)?c.duration(o,a,t.length):c.duration)/K.speed,e.push(c)}})}),e},T=function(t,n){var e=R(t,n),r=d(e,["name","from","to","delay","duration"]);return r.map(function(t){var n=v(t[0]);return n.animatables=t.map(function(t){return t.animatables}),n.totalDuration=n.delay+n.duration,n})},N=function(t,n){t.tweens.forEach(function(e){var r=e.to,a=e.from,i=t.duration-(e.delay+e.duration);e.from=r,e.to=a,n&&(e.delay=i)}),t.reversed=!t.reversed},S=function(t){return Math.max.apply(Math,t.map(function(t){return t.totalDuration}))},$=function(t){return Math.min.apply(Math,t.map(function(t){return t.delay}))},V=function(t){var n=[],e=[];return t.tweens.forEach(function(t){"css"!==t.type&&"transform"!==t.type||(n.push("css"===t.type?s(t.name):"transform"),t.animatables.forEach(function(t){e.push(t.target)}))}),{properties:h(n).join(", "),elements:h(e)}},X=function(t){var n=V(t);n.elements.forEach(function(t){t.style.willChange=n.properties})},Y=function(t){var n=V(t);n.elements.forEach(function(t){t.style.removeProperty("will-change")})},Q=function(t){var n=i.str(t)?c(t)[0]:t;return{path:n,value:n.getTotalLength()}},Z=function(t,n){var e=t.path,r=t.value*n,a=function(a){var i=a||0,o=n>1?t.value+i:r+i;return e.getPointAtLength(o)},i=a(),o=a(-1),u=a(1);switch(t.name){case"translateX":return i.x;case"translateY":return i.y;case"rotate":return 180*Math.atan2(u.y-o.y,u.x-o.x)/Math.PI}},q=function(t,n){var e=Math.min(Math.max(n-t.delay,0),t.duration),r=e/t.duration,a=t.to.numbers.map(function(n,e){var a=t.from.numbers[e],i=o[t.easing](r,t.elasticity),u=t.path?Z(t,i):a+i*(n-a);return u=t.round?Math.round(u*t.round)/t.round:u});return k(a,t.to.strings,t.from.strings)},D=function(n,e){var r;n.currentTime=e,n.progress=e/n.duration*100;for(var i=0;i<n.tweens.length;i++){var o=n.tweens[i];o.currentValue=q(o,e);for(var u=o.currentValue,s=0;s<o.animatables.length;s++){var c=o.animatables[s],f=c.id,l=c.target,p=o.name;switch(o.type){case"css":l.style[p]=u;break;case"attribute":l.setAttribute(p,u);break;case"object":l[p]=u;break;case"transform":r||(r={}),r[f]||(r[f]=[]),r[f].push(u)}}}if(r){t||(t=(x(document.body,a)?"":"-webkit-")+a);for(var i in r)n.animatables[i].target.style[t]=r[i].join(" ")}},z=function(t){var n={};return n.animatables=B(t.targets),n.settings=y(t,e),n.properties=F(t,n.settings),n.tweens=T(n.animatables,n.properties),n.duration=n.tweens.length?S(n.tweens):t.duration,n.delay=n.tweens.length?$(n.tweens):t.delay,n.currentTime=0,n.progress=0,n.ended=!1,n},G=[],H=0,J=function(){var t=function(){H=requestAnimationFrame(n)},n=function(n){if(G.length){for(var e=0;e<G.length;e++)G[e].tick(n);t()}else cancelAnimationFrame(H),H=0};return t}(),K=function(t){var n=z(t),e={};return n.tick=function(t){n.ended=!1,e.start||(e.start=t),e.current=Math.min(Math.max(e.last+t-e.start,0),n.duration),D(n,e.current);var r=n.settings;e.current>=n.delay&&(r.begin&&r.begin(n),r.begin=void 0,r.update&&r.update(n)),e.current>=n.duration&&(r.loop?(e.start=t,"alternate"===r.direction&&N(n,!0),i.num(r.loop)&&r.loop--):(n.ended=!0,n.pause(),r.complete&&r.complete(n)),e.last=0)},n.seek=function(t){D(n,t/100*n.duration)},n.pause=function(){Y(n);var t=G.indexOf(n);t>-1&&G.splice(t,1)},n.play=function(t){n.pause(),t&&(n=y(z(y(t,n.settings)),n)),e.start=0,e.last=n.ended?0:n.currentTime;var r=n.settings;"reverse"===r.direction&&N(n),"alternate"!==r.direction||r.loop||(r.loop=1),X(n),G.push(n),H||J()},n.restart=function(){n.reversed&&N(n),n.pause(),n.seek(0),n.play()},n.settings.autoplay&&n.play(),n},U=function(t){for(var n=l(i.arr(t)?t.map(p):p(t)),e=G.length-1;e>=0;e--)for(var r=G[e],a=r.tweens,o=a.length-1;o>=0;o--)for(var u=a[o].animatables,s=u.length-1;s>=0;s--)m(n,u[s].target)&&(u.splice(s,1),u.length||a.splice(o,1),a.length||r.pause())};return K.version=n,K.speed=1,K.list=G,K.remove=U,K.easings=o,K.getValue=I,K.path=Q,K.random=f,K})}]);
},{}],16:[function(require,module,exports){
!function(e){function t(n){if(i[n])return i[n].exports;var r=i[n]={exports:{},id:n,loaded:!1};return e[n].call(r.exports,r,r.exports,t),r.loaded=!0,r.exports}var i={};return t.m=e,t.c=i,t.p="",t(0)}([function(e,t){function i(e){var t=new THREE.Vector3(0,1,0);return a.setFromUnitVectors(n,e),t.applyQuaternion(a),t}if("undefined"==typeof AFRAME)throw new Error("Component attempted to register before AFRAME was available.");var n=new THREE.Vector3(0,0,1),r=THREE.Math.degToRad;AFRAME.registerComponent("curve-point",{schema:{},init:function(){this.el.addEventListener("componentchanged",this.changeHandler.bind(this)),this.el.emit("curve-point-change")},changeHandler:function(e){"position"==e.detail.name&&this.el.emit("curve-point-change")}}),AFRAME.registerComponent("curve",{schema:{type:{type:"string",default:"CatmullRom",oneOf:["CatmullRom","CubicBezier","QuadraticBezier","Line"]},closed:{type:"boolean",default:!1}},init:function(){this.pathPoints=null,this.curve=null,this.el.addEventListener("curve-point-change",this.update.bind(this))},update:function(e){if(this.points=Array.from(this.el.querySelectorAll("a-curve-point, [curve-point]")),this.points.length<=1)console.warn("At least 2 curve-points needed to draw a curve"),this.curve=null;else{var t=this.points.map(function(e){return void 0!==e.x&&void 0!==e.y&&void 0!==e.z?e:e.object3D.getWorldPosition()});if(!AFRAME.utils.deepEqual(t,this.pathPoints)||"CustomEvent"!==e&&!AFRAME.utils.deepEqual(this.data,e)){if(this.curve=null,this.pathPoints=t,this.threeConstructor=THREE.CatmullRomCurve3,!this.threeConstructor)throw new Error("No Three constructor of type (case sensitive): "+this.data.type+"Curve3");this.curve=new this.threeConstructor(this.pathPoints),this.curve.closed=this.data.closed,this.el.emit("curve-updated")}}},remove:function(){this.el.removeEventListener("curve-point-change",this.update.bind(this))},closestPointInLocalSpace:function(e,t,n,r){if(!this.curve)throw Error("Curve not instantiated yet.");t=t||.1/this.curve.getLength(),r=r||.5,n=n||.5,r/=2;var a=n+r,s=n-r,o=this.curve.getPointAt(a),c=this.curve.getPointAt(s),u=o.distanceTo(e),h=c.distanceTo(e),l=u<h;if(r<t){var v=this.curve.getTangentAt(l?a:s);if(r<t)return{result:l?a:s,location:l?o:c,distance:l?u:h,normal:i(v),tangent:v}}return u<h?this.closestPointInLocalSpace(e,t,a,r):this.closestPointInLocalSpace(e,t,s,r)}});var a=new THREE.Quaternion;AFRAME.registerShader("line",{schema:{color:{default:"#ff0000"}},init:function(e){this.material=new THREE.LineBasicMaterial(e)},update:function(e){this.material=new THREE.LineBasicMaterial(e)}}),AFRAME.registerComponent("draw-curve",{schema:{curve:{type:"selector"}},init:function(){this.data.curve.addEventListener("curve-updated",this.update.bind(this))},update:function(){if(this.data.curve&&(this.curve=this.data.curve.components.curve),this.curve&&this.curve.curve){var e=this.el.getOrCreateObject3D("mesh",THREE.Line);lineMaterial=e.material?e.material:new THREE.LineBasicMaterial({color:"#ff0000"});var t=new THREE.Geometry;t.vertices=this.curve.curve.getPoints(10*this.curve.curve.points.length),this.el.setObject3D("mesh",new THREE.Line(t,lineMaterial))}},remove:function(){this.data.curve.removeEventListener("curve-updated",this.update.bind(this)),this.el.getObject3D("mesh").geometry=new THREE.Geometry}}),AFRAME.registerComponent("clone-along-curve",{schema:{curve:{type:"selector"},spacing:{default:1},rotation:{type:"vec3",default:"0 0 0"},scale:{type:"vec3",default:"1 1 1"}},init:function(){this.el.addEventListener("model-loaded",this.update.bind(this)),this.data.curve.addEventListener("curve-updated",this.update.bind(this))},update:function(){if(this.remove(),this.data.curve&&(this.curve=this.data.curve.components.curve),!this.el.getObject3D("clones")&&this.curve&&this.curve.curve){var e=this.el.getObject3D("mesh"),t=this.curve.curve.getLength(),i=0,a=i,s=this.el.getOrCreateObject3D("clones",THREE.Group),o=new THREE.Object3D;for(e.scale.set(this.data.scale.x,this.data.scale.y,this.data.scale.z),e.rotation.set(r(this.data.rotation.x),r(this.data.rotation.y),r(this.data.rotation.z)),e.rotation.order="YXZ",o.add(e);a<=t;){var c=o.clone(!0);c.position.copy(this.curve.curve.getPointAt(a/t)),tangent=this.curve.curve.getTangentAt(a/t).normalize(),c.quaternion.setFromUnitVectors(n,tangent),s.add(c),a+=this.data.spacing}}},remove:function(){this.curve=null,this.el.getObject3D("clones")&&this.el.removeObject3D("clones")}}),AFRAME.registerPrimitive("a-draw-curve",{defaultComponents:{"draw-curve":{}},mappings:{curveref:"draw-curve.curve"}}),AFRAME.registerPrimitive("a-curve-point",{defaultComponents:{"curve-point":{}},mappings:{}}),AFRAME.registerPrimitive("a-curve",{defaultComponents:{curve:{}},mappings:{type:"curve.type"}})}]);
},{}],17:[function(require,module,exports){
var GamepadState;
// Copyright 2016-present, Oculus VR, LLC.
// All rights reserved.
//
// This source code is licensed under the license found in the
// LICENSE-examples file in the root directory of this source tree.
(function (exports, navigator) {
  // GamepadState uses navigator.getGamepads to maintain the combined button and axis state of all gamepads.
  // It also translates Gear VR specific buttons into semantic events for tapping and swiping.
  GamepadState = function () {
      this.pressedButtons = {};  // The pressed state of the buttons exposed by any active gamepad
      this.oldPressedButtons = {};  // The previous pressed state of the buttons exposed by any active gamepad
      this.gearVRButtons = {};   // The pressed state of the buttons for the Gear VR device specifically
      this.axes = {};            // The values of the axes exposed by any active gamepad
      this.gearVRAxes = {};      // The values of the axes for the Gear VR device specifically
      this.oldGearVRAxes = {};
      this.ongearvrinput = null; // A callback that is called when Gear VR button events are detected, as they would appear in the Carmel browser
  };

  // This should be called once per frame.
  GamepadState.prototype.update = function () {
    var self = this;

    // Check all gamepads every frame, and record button and axis information
    Array.prototype.forEach.call(navigator.getGamepads(), function (activePad, padIndex) {
      if (activePad && activePad.connected) {

        var isGearVRDevice = activePad.id.includes("Gear VR");

        // Update pressedButtons which is combined state for all gamepads
        activePad.buttons.forEach(function (gamepadButton, buttonIndex) {
          self.oldPressedButtons[buttonIndex] = self.pressedButtons[buttonIndex];
          self.pressedButtons[buttonIndex] = gamepadButton.pressed;

          // If this is the Gear VR device then track those buttons separately as well
          if (isGearVRDevice) {
            self.gearVRButtons[buttonIndex] = gamepadButton.pressed;
          }
        });

        // Update axes which is combined state for all gamepads
        self.axes = {};

        if (isGearVRDevice) {
          self.oldGearVRAxes = self.gearVRAxes;
          self.gearVRAxes = {};
        }

        activePad.axes.forEach(function (axisValue, axisIndex) {
          self.axes[axisIndex] = axisValue;

          // If this is the Gear VR device then track those axes separately as well
          if (isGearVRDevice) {
            self.gearVRAxes[axisIndex] = axisValue;
          }
        });
      }
    });

    // Raise Gear VR input events based on the state of the gamepad
    if (!this.oldPressedButtons[0] && this.gearVRButtons[0]) {
      this._onGearVRInput("tap");
    }
    if (!this.oldGearVRAxes[0] && this.gearVRAxes[0] < 0) {
      this._onGearVRInput("right");
    }
    if (!this.oldGearVRAxes[0] && this.gearVRAxes[0] > 0) {
      this._onGearVRInput("left");
    }
    if (!this.oldGearVRAxes[1] && this.gearVRAxes[1] < 0) {
      this._onGearVRInput("up");
    }
    if (!this.oldGearVRAxes[1] && this.gearVRAxes[1] > 0) {
      this._onGearVRInput("down");
    }
  };

  GamepadState.prototype._onGearVRInput = function (direction) {
    if (this.ongearvrinput) {
      this.ongearvrinput(direction);
    }
  };
})(window, window.navigator);

module.exports = GamepadState;

},{}]},{},[14]);
