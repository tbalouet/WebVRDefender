/* global AFRAME */
(function(){
    "use strict";

    AFRAME.registerComponent("enemy", {
        init: function() {
            var el = this.el;
            el.addEventListener("click", function () {
                el.setAttribute("visible", false);
                el.emit("kill");
            });
        }
    });

  AFRAME.registerComponent('enemy-pool', {
    init: function() {
	var enemyTypes = [ "monster", "dragon" ]
	var type
	var el = this.el;

	// wave 1
	type = enemyTypes[0]
	for (var i=0; i<7; i++){
		var enemy = document.createElement("a-obj-model")
		enemy.setAttribute("src", "#"+type+"-obj")
		enemy.setAttribute("mtl", "#"+type+"-mtl")
		enemy.setAttribute("rotation", "0 180 0")
		var scaleFactor = Math.random()+5
		enemy.setAttribute("scale", scaleFactor + " " + scaleFactor + " " + scaleFactor)
		var dur = Math.random()*20000
		var delay = 5000 + Math.random()*5000
		enemy.setAttribute("alongpath", "curve: #"+type+"-track; delay:" + delay + "; dur:"+dur+";")
		enemy.setAttribute("enemy", "")
		enemy.addEventListener('movingended', function () {
			if (enemy.getAttribute("visible"))
				document.querySelector("[goal]").emit("hit")
			});
		enemy.setAttribute("sound", "on: kill; src: url(http://vatelier.net/MyDemo/WebVRDefender/public/assets/sounds/Zombie_In_Pain-SoundBible.com-134322253.mp3)")
		this.el.appendChild(enemy)
	}

	// wave 2
	type = enemyTypes[1]
	for (var i=0; i<3; i++){
		var enemy = document.createElement("a-obj-model")
		enemy.setAttribute("src", "#"+type+"-obj")
		enemy.setAttribute("mtl", "#"+type+"-mtl")
		enemy.setAttribute("rotation", "0 0 0")
		var scaleFactor = Math.random()+3
		enemy.setAttribute("scale", scaleFactor + " " + scaleFactor + " " + scaleFactor)
		var dur = Math.random()*20000
		var delay = 5000 + Math.random()*5000
		enemy.setAttribute("alongpath", "rotate:true ; curve: #"+type+"-track; delay:" + delay + "; dur:"+dur+";")
		enemy.setAttribute("enemy", "")
		enemy.addEventListener('movingended', function () {
			if (enemy.getAttribute("visible"))
				document.querySelector("[goal]").emit("hit")
			});
		enemy.setAttribute("sound", "on: kill; src: url(http://vatelier.net/MyDemo/WebVRDefender/public/assets/sounds/European_Dragon_Roaring_and_breathe_fire-daniel-simon.mp3)")
		this.el.appendChild(enemy)
	}
    }
  });

})();
