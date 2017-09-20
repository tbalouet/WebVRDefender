/* global AFRAME */
(function(){
    "use strict";

    AFRAME.registerComponent("player", {
        schema: {
            slotID: { type: "string", default: "" },
            type: { type: "string", default: "" }
        },
        init: function() {      
            this.el.setAttribute("networked", {
                template          : "#tower-template",
                showLocalTemplate : false
            });

            this.el.setAttribute("assign-slot", { slotID : this.data.slotID});
            this.el.setAttribute("camera", {});
            this.el.setAttribute("look-controls", {});
            this.el.setAttribute("presentation-display", {});

            var cursor = document.createElement("a-entity");
            cursor.setAttribute("cursor", "fuse: true; fuseTimeout: 200");
            cursor.setAttribute("position", "0 0 -12");
            cursor.setAttribute("geometry", "primitive: ring");
            cursor.setAttribute("material", "color: black; shader: flat");
            this.el.appendChild(cursor);


            let mesh = document.createElement("a-entity");
            switch(this.data.type){
            case "threedof":
                mesh.setAttribute("obj-model", {obj: "#turet-obj", mtl: "#turet-mtl"});
                mesh.setAttribute("position", "0 -0.5 0");
                mesh.setAttribute("rotation", "0 180 0");
                break;
            }
            this.el.appendChild(mesh);
        }
    });

})();
