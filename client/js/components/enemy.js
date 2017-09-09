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

})()
