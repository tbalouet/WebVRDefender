/* global AFRAME */
// Use of this source code is governed by an Apache license that can be
// found in the LICENSE file.
var WVRTD = {};
(function(){
  "use strict";

  require("../lib/networked-aframe.js");
  require("./components/assign_slot.js");
  require("./components/player.js");
  require("./components/enemy.js");
  require("./components/gameClient.js");
  require("./components/goal.js");
  require("./components/gameDynamicsParameters.js");
  require("./components/presentation.js");
  var DevDet = require("./devDet.js");


  /**
  * Callback called on Networked AFrame server connect
  * @param  {[type]} data [description]
  * @return {[type]}      [description]
  */
  window.onConnectCB = function(){
    if(!document.querySelector("a-scene")){
      return;
    }
    document.querySelector("[wvrtd-game-client]").components["wvrtd-game-client"].initClient();
  };

  window.onload = function(){
    //Fetch the room name in the URL or puts you in room42
    let room = AFRAME.utils.getUrlParameter("room");
    if(!room){
      document.body.removeChild(document.querySelector("a-scene"));
      document.querySelector("#welcomeCard").classList.remove("hide");
    }
    else{
      document.querySelector("#welcomeCard").classList.add("hide");
      document.querySelector("#gameModeCard").classList.remove("hide");
    }

    if(document.querySelector("a-scene")){
      function onSceneLoaded(){
        //Device Detection
        DevDet.detectDevice.then(function(data){
          WVRTD.devDet = data;

          var gameModeChoiceDiv = document.querySelector("#gameModeChoiceDiv");
          function createBtn(id, name){
            var btn = document.createElement("a");
            btn.id = id;
            btn.classList.add("waves-effect");
            btn.classList.add("waves-light");
            btn.classList.add("btn");
            btn.innerHTML = name;
            gameModeChoiceDiv.appendChild(btn);
          }

          switch(WVRTD.devDet.detectedDevice){
            case WVRTD.devDet.deviceType.GEARVR:
            case WVRTD.devDet.deviceType.MOBILE:
              createBtn("gameChoiceVR", "VR MODE");
              createBtn("gameChoiceMW", "MAGIC WINDOW MODE");
              break;
            case WVRTD.devDet.deviceType.VIVE:
            case WVRTD.devDet.deviceType.RIFT:
              createBtn("gameChoiceVR", "VR MODE");
              createBtn("gameChoiceMW", "DESKTOP MODE");
              break;
            case WVRTD.devDet.deviceType.DESKTOP:
              createBtn("gameChoiceMW", "DESKTOP MODE");
              break;
          }

          document.querySelector("a-scene").setAttribute( "networked-scene", {app: "WebVRDefender", room: room, debug: true, onConnect: "onConnectCB"});

          document.getElementById("loaderDiv").classList.remove("make-container--visible");
          WVRTD.loaded = true;
        })
      }
      (document.querySelector("a-scene").hasLoaded ? onSceneLoaded() : document.querySelector("a-scene").addEventListener("loaded", onSceneLoaded));
    }
  };
})();
