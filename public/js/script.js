(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function(){
  "use strict";

  AFRAME.registerComponent('assign-slot', {
    init: function() {
      let id = document.querySelectorAll(".tower").length;
      var newpos = document.getElementById("slot"+id).getAttribute("position");
      this.el.setAttribute("position", newpos);
    }
  });

})()
},{}],2:[function(require,module,exports){
(function(){
  "use strict";

  AFRAME.registerComponent('enemy', {
    init: function() {
    }
  });

})()
},{}],3:[function(require,module,exports){
// Use of this source code is governed by an Apache license that can be
// found in the LICENSE file.
(function(){
	"use strict";
  var Util         = require("./util.js");
  require("./components/assign_slot.js");
  require("./components/enemy.js");
  // currently empty

  // should become a component
  var spots = [ 
	{pos: new THREE.Vector3( 0, 1, -1 ), occupied: false},
	{pos: new THREE.Vector3( 2, 1, -1 ), occupied: false},
	{pos: new THREE.Vector3( 4, 1, -1 ), occupied: false},
	{pos: new THREE.Vector3( 1, 1, -2 ), occupied: false},
	{pos: new THREE.Vector3( 3, 1, -2 ), occupied: false}, 
	{pos: new THREE.Vector3( 5, 1, -2 ), occupied: false} ]
  function addSpots(){
	//console.log(AFRAME.scene[0])
  }
  function availableSpots(){
	var available = 0
	for (var spot in spots){
		if (!spots[spot].occupied)
			available++
	}
	return available
  }
  function getNextSpot(){
	  if (availableSpots()>0){
		for (var spot in spots){
			if (!spots[spot].occupied){
				spots[spot].occupied = true
				return spots[spot].pos
			}
		}
	  }
  }
  console.log(addSpots())
  
  /*
  ToDo for game dynamics
	allow spot to be picked by gazing at it
  */

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

    document.querySelector("a-scene").appendChild(player);
  }

  window.onload = function(){
    function onSceneLoaded(){
      document.getElementById("loaderDiv").classList.remove('make-container--visible');
    }
    (document.querySelector("a-scene").hasLoaded ? onSceneLoaded() : document.querySelector("a-scene").addEventListener("loaded", onSceneLoaded));
  };
})();

},{"./components/assign_slot.js":1,"./components/enemy.js":2,"./util.js":4}],4:[function(require,module,exports){
var Util = {};
(function(){
  "use strict";
  /**
   * Generate an Unique ID
   * @return {string} Unique ID of length 4
   */
  Util.guid = function(){
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4();
  }
})()

module.exports = Util;

},{}]},{},[3]);
