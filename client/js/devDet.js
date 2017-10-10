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
var device = {};
device.type = new Enum(['GEARVR', 'MOBILE', 'DESKTOP', 'VIVE', 'RIFT', 'DESKTOP', 'UNKNOWN']);

//detected device
DevDet.detectedDevice = null;
DevDet.displayDevice = null;

//device detection
DevDet.detectDevice = function(){
    navigator.getVRDisplays().then(function (displays) {
        console.log(displays[0]);

        if(AFDevice.isGearVR()){
            DevDet.detectedDevice = device.type.GEARVR;
        }
        else if(AFDevice.isMobile()){
            DevDet.detectedDevice = device.type.MOBILE;
        }
        else if (displays.length > 0){ //trys to match high end headsets
             switch (displays[0].displayName) {
                case 'Oculus VR HMD':
                DevDet.detectedDevice = device.type.RIFT;
                    break;
                case 'HTC Vive MV':
                DevDet.detectedDevice = device.type.VIVE;
                    break;          
                default: //undetected
                    console.log('undetected device name: ' + displays[0].displayName);
                    break;
            }
        }
        else {DevDet.detectedDevice = device.type.UNKNOWN;}
        DevDet.displayDevice = displays[0];
    });
};

})();

module.exports = DevDet;
