
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
var detectedDevice;
var displayDevice;

//device detection
function deviceDetection(){
    navigator.getVRDisplays().then(function (displays) {
        console.log(displays[0]);

        if(AFDevice.isGearVR()){
            detectedDevice = device.type.GEARVR;
        }
        else if(AFDevice.isMobile()){
            detectedDevice = device.type.MOBILE;
        }
        else if (displays.length > 0){ //trys to match high end headsets
             switch (displays[0].displayName) {
                case 'Oculus VR HMD':
                    detectedDevice = device.type.RIFT;
                    break;
                case 'HTC Vive MV':
                    detectedDevice = device.type.VIVE;
                    break;          
                default: //undetected
                    console.log('undetected device name: ' + displays[0].displayName);
                    break;
            }
        }
        else {detectedDevice = device.type.UNKNOWN;}
        displayDevice = displays[0];
    });
};