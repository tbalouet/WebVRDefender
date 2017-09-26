/* global AFRAME */
// Use of this source code is governed by an Apache license that can be
// found in the LICENSE file.
var WVRD = {};
(function(){
    "use strict";

  require("../lib/networked-aframe.js");
  require("./components/assign_slot.js");
  require("./components/enemy.js");
  require("./components/gameClient.js");
  require("./components/goal.js");
  require("./components/gameDynamicsParameters.js");

  /**
   * Callback called on Networked AFrame server connect
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
    window.onConnectCB = function(){
        document.querySelector("[game-client]").components["game-client"].initClient();
    };

    window.onload = function(){
        function onSceneLoaded(){
          //Fetch the room name in the URL or puts you in room42
            let room = AFRAME.utils.getUrlParameter("room");
            if(!room){
                room = "room42";
                console.log("======== JOIN DA ROOM: localhost:3000/?room="+room+" ========");
            }
            document.querySelector("a-scene").setAttribute( "networked-scene", {app: "WebVRDefender", room: room, debug: true, onConnect: "onConnectCB"});

            document.getElementById("loaderDiv").classList.remove("make-container--visible");
            WVRD.loaded = true;
        }
        (document.querySelector("a-scene").hasLoaded ? onSceneLoaded() : document.querySelector("a-scene").addEventListener("loaded", onSceneLoaded));
    };
})();
