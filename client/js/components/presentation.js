(function(){
  "use strict";

  AFRAME.registerComponent('presentation-display', {
    init: function() {
	var el = this.el;
	var text = document.createElement("a-text")
	var content = "The terrible vikings are attacking our village, we need to defend. Look at them and laser them to Valhala!"
	text.setAttribute("color", "brown")
	text.setAttribute("value", content)
	text.setAttribute("position", "-1 0.5 -0.3")
	el.appendChild(text)
    },
  });

})()
