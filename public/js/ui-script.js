(function(){
  "use strict";

  /**
   * ============================
   * ======== QR Code UI ========
   */
  
  /**
   * Generate the QR Code image and display it
   */
  document.getElementById("butQRCode").addEventListener("click", function(event){
    let typeNumber           = 12;//We need a model a bit high for long URLs. 12 should do it
    let errorCorrectionLevel = 'L';
    let qr                   = qrcode(typeNumber, errorCorrectionLevel);
    qr.addData(location.href);
    qr.make();
    document.getElementById('qrcode').innerHTML = qr.createImgTag(4);

    toggleDialog("qrCodeDiv");


    document.getElementById("closeQRCode").addEventListener("click", function(event){
      toggleDialog("qrCodeDiv");
    });

    event.stopPropagation();
  });

  var gameChoice = undefined;
  function onGameChoiceClick(type){
    gameChoice = type;
    document.querySelector("#roomBtnDiv").classList.add("hide");
    document.querySelector("#roomInputBtn").classList.remove("hide");

    document.querySelector("#roomChoiceGo").addEventListener("click", function(){
      location.href = location.origin + location.pathname + "?room=" + document.querySelector("#room_name").value;
    });
  }
  document.querySelector("#createGameBtn").addEventListener("click", function(){
    onGameChoiceClick("CREATE");
  });
  document.querySelector("#joinGameBtn").addEventListener("click", function(){
    onGameChoiceClick("JOIN");
  });


  /**
   * Toggles the visibility of the appropriate dialog screen. 
   * @param  {string} eltID ID of the screen to show/hide
   * @param  {boolean} forceClose force close even if not open (remove check)
   */
  function toggleDialog(eltID, forceClose) {
    let domElt = document.getElementById(eltID);
    if(!domElt){
      return;
    }

    if (domElt.classList.contains('make-container--visible') || forceClose) {
      domElt.classList.remove('make-container--visible');
    } else {
      domElt.classList.add('make-container--visible');
    }
  };
})();