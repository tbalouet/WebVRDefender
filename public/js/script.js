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
	var el = this.el;
    	el.addEventListener('mouseenter', function () {
		el.setAttribute('visible', false);
	});
    }
  });

  AFRAME.registerComponent('enemy-pool', {
    init: function() {
	var el = this.el;
	for (var i=0; i<3; i++){
		var enemy = document.createElement("a-obj-model")
		enemy.setAttribute("src", "#monster-obj")
		enemy.setAttribute("mtl", "#monster-mtl")
		enemy.setAttribute("rotation", "0 180 0")
		var scaleFactor = Math.random()+5
		enemy.setAttribute("scale", scaleFactor + " " + scaleFactor + " " + scaleFactor)
		var dur = Math.random()*20000
		enemy.setAttribute("alongpath", "curve: #monster-track; dur:"+dur+";")
		enemy.setAttribute("enemy", "")
		enemy.addEventListener('movingended', function () {
			if (enemy.getAttribute("visible"))
				console.log( document.querySelector("[goal]").components["goal"] ) // .decreaseLife()
			});
		this.el.appendChild(enemy)
		// should register an event for reaching the end of path, if visible when reached become invisible then decrease goal life point
	}
    }
  });

})()

},{}],3:[function(require,module,exports){
(function(){
  "use strict";

  AFRAME.registerComponent('goal', {
    init: function() {
	var el = this.el;
	var life = document.createElement("a-cylinder")
	life.setAttribute("color", "green")
	life.setAttribute("height", "10")
	el.appendChild(life)
    }
  });
	// should have a method to decrease life point and update life visual

})()

},{}],4:[function(require,module,exports){
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

},{"./components/assign_slot.js":1,"./components/enemy.js":2,"./components/goal.js":3,"./util.js":5}],5:[function(require,module,exports){
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

},{}]},{},[4]);
