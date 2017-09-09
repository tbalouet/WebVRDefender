// Use of this source code is governed by an Apache license that can be
// found in the LICENSE file.
(function(){
	"use strict";
  var Util         = require("./util.js");
  require("./components/assign_slot.js");
  require("./components/enemy.js");
  require("./components/goal.js");

  window.onConnectCB = function(data){
    let player = document.createElement("a-entity");
    player.id = "player";
    player.setAttribute("networked", {
      template          : "#tower-template",
      showLocalTemplate : false
    });
    player.setAttribute("assign-slot", {});
    player.setAttribute("camera", {});
    player.setAttribute("look-controls", {});
    var cursor = document.createElement("a-cursor");
    player.appendChild(cursor);

    document.querySelector("a-scene").appendChild(player);
  }

  window.onload = function(){
    function onSceneLoaded(){
      document.getElementById("loaderDiv").classList.remove('make-container--visible');
    }
    (document.querySelector("a-scene").hasLoaded ? onSceneLoaded() : document.querySelector("a-scene").addEventListener("loaded", onSceneLoaded));
  };
})();
