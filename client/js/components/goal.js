(function(){
  "use strict";

  AFRAME.registerComponent('goal', {
    init: function() {
	var obj = "model.obj"
	var mtl = "materials.mtl"
	var path="public/assets/models/castle/"
	var el = this.el;
	var mesh = document.createElement("a-obj-model")
	mesh.setAttribute("id", "goal-mesh")
	mesh.setAttribute("src", path+obj)
	mesh.setAttribute("mtl", path+mtl)
	el.appendChild(mesh)
	var life = document.createElement("a-cylinder")
	// now to rescale because of parent
	life.setAttribute("color", "green")
	life.setAttribute("height", "10")
	life.setAttribute("scale", "0.05 0.05 0.05")
	life.setAttribute("position", "0 0 0")
	el.appendChild(life)

	// could have also used a component function
    	el.addEventListener('hit', function () {
		var height = parseInt( life.getAttribute("height") )
		height -= 1
		life.setAttribute("height", height)
		if (height < 6) {
			path="public/assets/models/castle_lvl1/"
			mesh.setAttribute("src", path+obj)
			mesh.setAttribute("mtl", path+mtl)
		}
		if (height < 3) {
			life.setAttribute("color", "red")
			path="public/assets/models/castle_lvl2/"
			mesh.setAttribute("src", path+obj)
			mesh.setAttribute("mtl", path+mtl)
		}
		if (height < 1) {
			life.setAttribute("color", "red")
			path="public/assets/models/castle_lvl3/"
			mesh.setAttribute("src", path+obj)
			mesh.setAttribute("mtl", path+mtl)
		}
	});
    },
  });

})()
