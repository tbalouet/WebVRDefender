// Use of this source code is governed by an Apache license that can be
// found in the LICENSE file.
module.exports = (function(){
    let NODE_ENV = "dev";
    process.argv.forEach(function (val, index, array) {
        if(val.indexOf("NODE_ENV") !== -1){
            NODE_ENV = val.split("=")[1];
        }
    });

    switch(NODE_ENV){
        case 'dev':
            return {
                maxAge     : 1,//Set short maxage to allow no cache
                port       : 3000
            };

        case 'prod':
            return {
                maxAge     : 86400000,//One day cache
                port       : 80
            };

        default:
            return {error : true};
    }
})();