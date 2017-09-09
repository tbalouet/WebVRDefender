(function(){
  "use strict";

  AFRAME.registerComponent('goal', {
    init: function() {
	var el = this.el;
	var life = document.createElement("a-cylinder")
	life.setAttribute("color", "green")
	life.setAttribute("height", "10")
	el.appendChild(life)
    },
    decreaseLife: function(){
	alert("arg")
    }
  });
	// should have a method to decrease life point and update life visual

})()
