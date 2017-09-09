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
