/* global AFRAME */
// Use of this source code is governed by an Apache license that can be
// found in the LICENSE file.
window.WVRTD = {};
(function(){
  "use strict";
  
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
    NAF.options.compressSyncPackets = true;
    NAF.options.useLerp = false;
    document.querySelector("[wvrtd-game-client]").components["wvrtd-game-client"].initClient();
  };

  window.onload = function(){
    WVRTD.gameLaunchUI = new GameLaunchUI();
  };
})();
