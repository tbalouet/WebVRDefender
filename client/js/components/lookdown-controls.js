/* global AFRAME */
(function(){
  "use strict";

  // internals
  var EPS = 0.000001;
  var panStart = new THREE.Vector3();
  var panMove = new THREE.Vector3();
  var panDelta = new THREE.Vector3();
  var STATE = { NONE : -1, ROTATE : 0, DOLLY : 1, PAN : 2 };
  var state = STATE.NONE;

  AFRAME.registerComponent("wvrtd-lookdown-controls", {
    init: function() {
      this.object = this.el.object3D;
      this.zoomSpeed = 0.005;
      this.minDistance = 0;
      this.maxDistance = Infinity;
      this.scalarPan = 5;

      this.domElement = document;

      this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
      this.domElement.addEventListener( 'mousedown', this.onMouseDown.bind(this), false );
      this.domElement.addEventListener( 'mousewheel', this.onMouseWheel.bind(this), false );

      document.body.style.cursor = "-webkit-grab";
      document.addEventListener("keyup", this.onKeyUp.bind(this));
    },
    onMouseDown: function( event ) {
      if ( this.enabled === false ) { return; }
      event.preventDefault();

      if ( event.button === 0 ) {
        state = STATE.PAN;

        panStart.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        panStart.z = -( event.clientY / window.innerHeight ) * 2 + 1;
      }
      this.domElement.addEventListener( 'mousemove', this.onMouseMove.bind(this), false );
      this.domElement.addEventListener( 'mouseup', this.onMouseUp.bind(this), false );

      document.body.classList.add('a-grabbing');
    },
    onMouseMove: function( event ) {
      if ( this.enabled === false ) return;

      event.preventDefault();

      var isPointerLock = (document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement) !== undefined;
      if ( state === STATE.PAN || isPointerLock) {
        if(isPointerLock){
          panMove.x = event.movementX;
          panMove.z = event.movementY;

          panDelta.copy(panMove);
          panDelta.multiplyScalar(0.001);
        }
        else{
          panMove.x = ( event.clientX / window.innerWidth ) * 2 - 1;
          panMove.z = -( event.clientY / window.innerHeight ) * 2 + 1;

          panDelta.subVectors(panStart, panMove);
          panDelta.multiplyScalar(this.scalarPan);
          panDelta.z *= -1;
        }
        panDelta.add(this.object.position);

        this.el.setAttribute("position", AFRAME.utils.coordinates.stringify(panDelta));

        panStart.copy(panMove);
      }
    },
    onMouseUp: function( /* event */ ) {
      if ( this.enabled === false ) return;

      this.domElement.removeEventListener( 'mousemove', this.onMouseMove.bind(this), false );
      this.domElement.removeEventListener( 'mouseup', this.onMouseUp.bind(this), false );
      state = STATE.NONE;
      document.body.classList.remove('a-grabbing');
    },
    onMouseWheel: function( event ) {
      if ( this.enabled === false ) return;
      var delta = 0;

      if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9
        delta = event.wheelDelta;
      } else if ( event.detail ) { // Firefox
        delta = - event.detail;
      }

      panDelta.copy(this.object.position);
      panDelta.y += ( delta * -this.zoomSpeed );
      this.el.setAttribute("position", AFRAME.utils.coordinates.stringify(panDelta));
    },
    onKeyUp: function(event){
      var key = event.keyCode ? event.keyCode : event.which;
      if (key == 13) {
        this.el.setAttribute("position", "3 10 2");
      }
    }
  });
})();
