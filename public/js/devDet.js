var DevDet = {};

(function(){
    "use strict";

//AFrame device utils
var AFDevice = AFRAME.utils.device;

//vr device enum setup
function Enum(values){
    for( var i = 0; i < values.length; ++i ){
        this[values[i]] = i;
    }
    return this;
}
DevDet.deviceType = new Enum(['GEARVR', 'MOBILE', 'DESKTOP', 'VIVE', 'RIFT', 'WINDOWSMR', 'UNKNOWN']);

//detected device
DevDet.detectedDevice = null;
DevDet.displayDevice = null;

//device detection
DevDet.detectDevice = new Promise(function(resolve, reject){
  try{
    navigator.getVRDisplays().then(function (displays) {
      console.log("[DevDet devices]", displays[0]);

      DevDet.displayDevice = displays[0];

      if(AFDevice.isGearVR()){
        DevDet.detectedDevice = DevDet.deviceType.GEARVR;
      }
      else if(AFDevice.isMobile()){
        DevDet.detectedDevice = DevDet.deviceType.MOBILE;
      }
      else if (displays.length > 0){ //trys to match high end headsets
        switch (displays[0].displayName) {
          case 'Oculus VR HMD':
            DevDet.detectedDevice = DevDet.deviceType.RIFT;
            break;
          case 'OpenVR HMD':
            DevDet.detectedDevice = DevDet.deviceType.VIVE;
            break;
          case 'HTC Vive MV':
            DevDet.detectedDevice = DevDet.deviceType.VIVE;
            break;
          case 'Acer AH100':
            DevDet.detectedDevice = DevDet.deviceType.WINDOWSMR;
            break;
          default: //undetected
            console.log('undetected device name: ' + displays[0].displayName);
            break;
        }
      }
      else if(displays.length === 0){
        DevDet.detectedDevice = DevDet.deviceType.DESKTOP;
        DevDet.displayDevice = {displayName: "desktop"};
      }
      else {
        DevDet.detectedDevice = DevDet.deviceType.UNKNOWN;
      }
      resolve(DevDet);
    });
  }
  catch(err){
    reject(err);
  }
});

})();
