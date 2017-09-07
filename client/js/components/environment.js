(function(){
  "use strict";

  /**
   * Loads and setup ground model.
   * @param  {[type]} ) {                 var objectLoader;      var object3D [description]
   * @return {[type]}   [description]
   */
  AFRAME.registerComponent('ground', {
    init: function () {
      var objectLoader;
      var object3D = this.el.object3D;
      var MODEL_URL = 'https://cdn.aframe.io/link-traversal/models/ground.json';
      if (this.objectLoader) { return; }
      objectLoader = this.objectLoader = new THREE.ObjectLoader();
      objectLoader.crossOrigin = '';
      objectLoader.load(MODEL_URL, function (obj) {
        obj.children.forEach(function (value) {
          value.receiveShadow = true;
          value.material.shading = THREE.FlatShading;
        });
        object3D.add(obj);
      });
    }
  });

  /**
   * Load the sky gradient for the skybox
   * @param  {[type]} 'skyGradient'   [description]
   * @param  {[type]} options.schema: {                                                       colorTop: {   type:            'color',      default: 'black', is:           'uniform' [description]
   * @param  {[type]} colorBottom:    {            type:         'color', default: 'red', is: 'uniform' }                                           }       [description]
   * @param  {[type]} vertexShader:   [                                                        'varying  vec3 vWorldPosition;' [description]
   * @param  {[type]} 'void           main(         [description]
   * @return {[type]}                 [description]
   */
  AFRAME.registerShader('skyGradient', {
    schema: {
      colorTop: { type: 'color', default: 'black', is: 'uniform' },
      colorBottom: { type: 'color', default: 'red', is: 'uniform' }
    },

    vertexShader: [
      'varying vec3 vWorldPosition;',

      'void main() {',

        'vec4 worldPosition = modelMatrix * vec4( position, 1.0 );',
        'vWorldPosition = worldPosition.xyz;',

        'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

      '}'

    ].join('\n'),

    fragmentShader: [
      'uniform vec3 colorTop;',
      'uniform vec3 colorBottom;',

      'varying vec3 vWorldPosition;',

      'void main()',

      '{',
        'vec3 pointOnSphere = normalize(vWorldPosition.xyz);',
        'float f = 1.0;',
        'if(pointOnSphere.y > - 0.2){',

          'f = sin(pointOnSphere.y * 2.0);',

        '}',
        'gl_FragColor = vec4(mix(colorBottom,colorTop, f ), 1.0);',

      '}'
    ].join('\n')
  });
})();