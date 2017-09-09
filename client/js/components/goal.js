(function(){
  "use strict";

  AFRAME.registerComponent('goal', {
    init: function() {
	var el = this.el;
	var life = document.createElement("a-cylinder")
	life.setAttribute("color", "green")
	life.setAttribute("height", "10")
	life.setAttribute("position", "0 0 -30")
	el.appendChild(life)

	// could have also used a component function
    	el.addEventListener('hit', function () {
		var height = parseInt( life.getAttribute("height") )
		height -= 1
		life.setAttribute("height", height)
		if (height < 5) 
			life.setAttribute("color", "red")
	});
    },
  });

})()
