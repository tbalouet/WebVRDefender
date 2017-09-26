/* global  */
var Util = {};
(function(){
  "use strict";
  /**
  * Generate an Unique ID
  * @return {string} Unique ID of length 4
  */
  Util.guid = function(){
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
    }
    return s4();
  };
})();

module.exports = Util;
