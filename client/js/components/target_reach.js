(function(){
  "use strict";

  AFRAME.registerComponent('target-reach', {
    // be cautious of racing conditions
    // could be enforced on first cardboard or Vive player only
    init: function() {
      var life = 3;
      //return; // testing performance cost of firebase: it's HEAVY!
      // note that is is heavy already without any of that processing...
      // returning here but uncommenting the inclusion and leaving only broadcasts is already a problem
      
      // should be wrapped in specific game logic helpers
      let channel = getChannel();
      console.log("channel",channel);
      let firebase = document.querySelector('a-scene').systems.firebase.firebase;
      firebase.database().ref(channel + '/score' ).set({life:life});
      var scoreRef = document.querySelector('a-scene').systems.firebase.firebase.database().ref(channel+'/score');
      
      var topscores = [{name: "myTeam", score: 1}, {name: "herTeam", score: 2}, {name: "hisTeam", score: 3}] ;
      firebase.database().ref(channel + '/topscores' ).set(topscores);
      firebase.database().ref(channel + '/topscores').once('value').then(function(snapshot) { console.log( snapshot.val() ) ; });
      
      
      var todosRef = firebase.database().ref(channel + '/entities');
      let id = "Cardboard0";
      let sc0 = todosRef.orderByChild("id").equalTo("slot"+id);
      let newpos = {};
      sc0.on("value", function(snapshot) {
        let val = snapshot.val();
        for (var prop in val) {
            console.log("pos sc0:", val[prop].position);
            newpos = val[prop].position;
            let myId = getPlayerId();
            if (id == myId){
              document.getElementById("avatar").setAttribute("position", newpos);
            }
            break;
        }
        // reassign the position to the player assigned there
        document.getElementById("slot"+id).setAttribute("position", newpos);
      });
      // should be done for all 4 players
      // make sure that X.on can be instanciated in a loop
      
      scoreRef.on('value', function(snapshot) {
        life = snapshot.val().life;
        console.log(life);
        
        var scoreEl = document.getElementById("score");
        while (scoreEl.firstChild) {
            scoreEl.removeChild(scoreEl.firstChild);
        }
        for (var i=0;i<life;i++){
          console.log("Display heart");
          //<a-collada-model src="#health" position="0 2 0"></a-collada-model>
          var heartEl = document.createElement("a-collada-model");
          heartEl.setAttribute("src", "#health");
          scoreEl.appendChild(heartEl);
        }
      });
      
      // this is just a test, it shouldn't be in this component
      window.setTimeout(function(){ document.getElementById("enemy1").emit("enemy1Animate"); }, 19000 );
      
      if ( getPlayerId() == "Cardboard2" ){
        window.setTimeout(function(){ document.getElementById("enemy2").setAttribute("alongpath__0", "path:0.5,0,-1 0,2,0 -1,0,0.5; closed:false; dur:10000;"); }, 13000 );
      } //testing    
      
      console.log("activating reachable target");
      var elements = document.getElementsByClassName("enemy");
      for (var i = 0; i < elements.length; i++) {
        console.log("found enemy ",i);
        elements[i].addEventListener('reachtarget_entered', function (){
        let vis = this.getAttribute("visible");
        console.log(vis);
        if (vis){
          console.log('life:', life);
          console.log('decrease health!');
          score--; //clean up
          //console.log("score before hit", score);
          if (life>1){
            life--; //actual decrease of score
            let channel = getChannel();
            firebase.database().ref(channel + '/score' ).set({life:life});
          } else {
            console.log("You loose");
          }
        }
      });
        
      }
      
    }
  });
})();