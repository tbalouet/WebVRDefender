// Use of this source code is governed by an Apache license that can be
// found in the LICENSE file.
var WVRD = {};
(function(){
	"use strict";

  require("../lib/networked-aframe.js");
  var Util         = require("./util.js");
  require("./components/environment.js");
  require("./components/assign_slot.js");
  require("./components/enemy.js");
  require("./components/gameClient.js");

  window.onConnectCB = function(){
    document.querySelector("[game-client]").components["game-client"].initClient();
  }

  window.onload = function(){

    function onSceneLoaded(){
      let room = AFRAME.utils.getUrlParameter("room");
      if(!room){
        room = "room42";//"room"+Math.floor(Math.random()*50);
        document.querySelector("[game-client]").components["game-client"].gameState.isMaster = true;
        alert("Join da room: localhost:3000/?room="+room);
      }
      document.querySelector("a-scene").setAttribute( "networked-scene", {app: "WebVRDefender", room: room, debug: true, onConnect: "onConnectCB"});

      document.getElementById("loaderDiv").classList.remove('make-container--visible');
    }
    (document.querySelector("a-scene").hasLoaded ? onSceneLoaded() : document.querySelector("a-scene").addEventListener("loaded", onSceneLoaded));
  };
})();