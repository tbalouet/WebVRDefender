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
