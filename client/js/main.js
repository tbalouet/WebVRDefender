// Use of this source code is governed by an Apache license that can be
// found in the LICENSE file.
(function(){
	"use strict";
  require("../lib/networked-aframe.js");
  var Util         = require("./util.js");
  require("./components/environment.js");
  require("./components/assign_slot.js");
  require("./components/enemy.js");
  require("./components/gameClient.js");

  window.onload = function(){
    function onSceneLoaded(){
      document.getElementById("loaderDiv").classList.remove('make-container--visible');
    }
    (document.querySelector("a-scene").hasLoaded ? onSceneLoaded() : document.querySelector("a-scene").addEventListener("loaded", onSceneLoaded));
  };
})();