/* global AFRAME */
// Use of this source code is governed by an Apache license that can be
// found in the LICENSE file.
window.WVRTD = {};
(function(){
  "use strict";

  require("../lib/networked-aframe.js");
  require("./components/assign_slot.js");
  require("./components/lookdown-controls.js");
  require("./components/player_threedof.js");
  require("./components/player_desktop.js");
  require("./components/enemy.js");
  require("./components/gameClient.js");
  require("./components/goal.js");
  require("./components/enemy_wave.js");
  var GameLaunchUI = require("./gameLaunchUI.js");

  /**
  * Callback called on Networked AFrame server connect
  * @param  {[type]} data [description]
  * @return {[type]}      [description]
  */
  window.onConnectCB = function(){
    if(!document.querySelector("a-scene")){
      return;
    }
    NAF.options.updateRate = 30;
    document.querySelector("[wvrtd-game-client]").components["wvrtd-game-client"].initClient();
  };

  window.onload = function(){
    WVRTD.gameLaunchUI = new GameLaunchUI();
  };
})();
