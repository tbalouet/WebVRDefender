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
	for (var i=0; i<7; i++){
		var enemy = document.createElement("a-obj-model")
		enemy.setAttribute("src", "#monster-obj")
		enemy.setAttribute("mtl", "#monster-mtl")
		enemy.setAttribute("rotation", "0 180 0")
		var scaleFactor = Math.random()+5
		enemy.setAttribute("scale", scaleFactor + " " + scaleFactor + " " + scaleFactor)
		var dur = Math.random()*20000
		var delay = 5000 + Math.random()*5000
		enemy.setAttribute("alongpath", "curve: #monster-track; delay:" + delay + "; dur:"+dur+";")
		enemy.setAttribute("enemy", "")
		enemy.addEventListener('movingended', function () {
			if (enemy.getAttribute("visible"))
				document.querySelector("[goal]").emit("hit")
			});
		this.el.appendChild(enemy)
	}
    }
  });

})()
