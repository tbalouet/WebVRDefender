var GameLaunchUI;

(function(){
  "use strict";

  var DevDet = require("./devDet.js");

  GameLaunchUI = function(){
    //Fetch the room name in the URL or puts you in room42
    this.room = AFRAME.utils.getUrlParameter("room");
    if(!this.room){
      this.initGameChoice();
    }
    else{
      document.querySelector("#welcomeCard").classList.add("hide");
      document.querySelector("#gameModeCard").classList.remove("hide");
      (document.querySelector("a-scene").hasLoaded ? this.onSceneLoaded() : document.querySelector("a-scene").addEventListener("loaded", this.onSceneLoaded.bind(this)));
    }
  };

  GameLaunchUI.prototype.initGameChoice = function(){
    document.body.removeChild(document.querySelector("a-scene"));
    document.querySelector("#welcomeCard").classList.remove("hide");

    function onGameChoiceClick(type){
      document.querySelector("#roomBtnDiv").classList.add("hide");
      document.querySelector("#roomInputBtn").classList.remove("hide");

      document.querySelector("#roomChoiceGo").addEventListener("click", function(){
        var roomName = document.querySelector("#room_name").value;
        if (roomName.length == 0){
          // if the user tries to enter a room without a name, generate one
          roomName = "RandomRoom"+parseInt( Math.random()*10000 )
        }
        location.href = location.origin + location.pathname + "?room=" + roomName
      });
    }
    document.querySelector("#createGameBtn").addEventListener("click", onGameChoiceClick);
    document.querySelector("#joinGameBtn").addEventListener("click", onGameChoiceClick);
  };

  GameLaunchUI.prototype.onSceneLoaded = function(){
    var that = this;

    //Device Detection
    DevDet.detectDevice.then(function(data){
      WVRTD.devDet = data;
      that.displayDeviceUI();

      document.querySelector("a-scene").setAttribute( "networked-scene", {app: "WebVRDefender", room: that.room, debug: true, onConnect: "onConnectCB"});

      document.getElementById("loaderDiv").classList.remove("make-container--visible");
      WVRTD.loaded = true;
    });
  };

  GameLaunchUI.prototype.displayDeviceUI = function(){
    var that = this;
    var gameModeChoiceDiv = document.querySelector("#gameModeChoiceDiv");
    function createBtn(id, name, aDeviceType){
      var btn = document.createElement("a");
      btn.id = id;
      btn.classList.add("waves-effect");
      btn.classList.add("waves-light");
      btn.classList.add("btn");
      btn.innerHTML = name;
      gameModeChoiceDiv.appendChild(btn);

      var deviceType = aDeviceType;
      btn.addEventListener("click", function(){
        that.onGameChoiceMade(deviceType);
      });
    }

    switch(WVRTD.devDet.detectedDevice){
      case WVRTD.devDet.deviceType.GEARVR:
      case WVRTD.devDet.deviceType.MOBILE:
      createBtn("gameChoiceVR", "VR MODE", WVRTD.devDet.deviceType.GEARVR);
      createBtn("gameChoiceMW", "MAGIC WINDOW MODE", WVRTD.devDet.deviceType.MOBILE);
      break;
      case WVRTD.devDet.deviceType.VIVE:
      case WVRTD.devDet.deviceType.RIFT:
      createBtn("gameChoiceVR", "VR MODE", WVRTD.devDet.deviceType.RIFT);
      createBtn("gameChoiceMW", "DESKTOP MODE", WVRTD.devDet.deviceType.DESKTOP);
      break;
      case WVRTD.devDet.deviceType.DESKTOP:
      createBtn("gameChoiceMW", "DESKTOP MODE", WVRTD.devDet.deviceType.DESKTOP);
      break;
    }
  };

  GameLaunchUI.prototype.onGameChoiceMade = function(deviceType){
    document.querySelector("[wvrtd-game-client]").components["wvrtd-game-client"].setDevice(deviceType);
    document.querySelector("#gameModeCard").classList.add("hide");
    document.querySelector("#playersListCard").classList.remove("hide");
    document.querySelector("#roomJoinIncentive").innerHTML += location.href;

    if(document.querySelector("[wvrtd-game-client]").components["wvrtd-game-client"].gameState){
      this.createPlayerList(document.querySelector("[wvrtd-game-client]").components["wvrtd-game-client"].gameState);
    }

    if(document.querySelector("#launchGame")){
      document.querySelector("#launchGame").addEventListener("click", function(){
        document.querySelector("[wvrtd-game-client]").components["wvrtd-game-client"].launchGame();
      })
    }
  };

  GameLaunchUI.prototype.createPlayerList = function(gameState){
    var nbPlayers = 0;
    for(var key in gameState.clients){
      if(gameState.clients.hasOwnProperty(key)){
        nbPlayers++;
      }
    }
    document.querySelector("#nbPlayersSpan").innerHTML = nbPlayers;
  };

  GameLaunchUI.prototype.removeLaunchGame = function(){
    if(document.querySelector("#playersListCard")){
      document.querySelector("#playersListCard").removeChild(document.querySelector("#launchGame"));
    }

    var spanWait = document.createElement("span");
    spanWait.id = "spanWait";
    spanWait.classList.add("card-title");
    spanWait.innerHTML = "Waiting for game master to launch game...";
    document.querySelector("#playersListCard").appendChild(spanWait);
  };

  GameLaunchUI.prototype.hideIntroUI = function(){
    document.querySelector("#introContainer").classList.add("hide");
  };
})();

module.exports = GameLaunchUI;
