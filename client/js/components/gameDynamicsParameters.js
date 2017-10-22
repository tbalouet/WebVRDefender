(function(){
  "use strict";

  AFRAME.registerComponent('wvrtd-game-dynamics-parameters', {
    schema:{
      waves       : {type: "array",  default: ["monster", "dragon" ]},
      wavesSize   : {type: "array",  default: [3, 2 ]},
      wavesHealth : {type: "array",  default: [100, 200 ]},
      wavesPace   : {type: "array",  default: [100, 50 ]},
      goalHeatlh  : {type: "number", default: 15}
    },
    init: function() {
      console.log("game parameters loaded", this.data)
      // can then be accessed as AFRAME.scenes[0].components["wvrtd-game-dynamics-parameters"].data
    },
  });

})()
