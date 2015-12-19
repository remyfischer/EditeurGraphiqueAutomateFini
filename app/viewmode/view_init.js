define(function(require){
    return{
        //extract states
        extractStates: function(data){
            //iterating over states objects in data file (JSON), making a JS array of objects
            var states=[];
            for(var i=0;i<data.length;i++){
                if(data[i].states){
                    states.push(data[i].states);
                }
            }
            return states;
        },
        // initialisation function : states : array of state objects
        init : function(states){
            var createSVG = require("viewmode/create_svg"),
                createForceLayout = require("viewmode/create_force_layout"),
                createCircles = require("viewmode/create_circles"),
                createPaths = require("viewmode/create_paths");

            if(states){
                var links=[],
                    dataset=[];
                // Compute the distinct nodes from the links.
                //très moyennement satisfait du bouzin ci-dessous
                states.forEach(function(data,i){
                    var cpt=0;
                    for(var key in data){
                        var state = data[key];
                        if(data.hasOwnProperty(key)){
                            state.fixed = true;
                            state.uniqueId = cpt;
                            state.name = key;
                            state.x = state.cx || setPositions(cpt);   //known position or random
                            state.y = state.cy || setPositions(cpt);

                            //add graphicEditor values if not set
                            if(!state.graphicEditor){
                                state.graphicEditor={};
                            }
                            dataset.push(state);
                        }
                        cpt++;
                    }
                    for(var key in data){
                        var state = data[key];
                        if(data.hasOwnProperty(key)){
                            if(state.transitions && state.transitions.length>0){
                                for(var i=0;i<state.transitions.length;i++){
                                    links.push({
                                        source : state.uniqueId,
                                        target :(function(data){
                                            for(var key in data){
                                                if(state.transitions[i].target==data[key].name){
                                                    return data[key].uniqueId;
                                                }
                                            }
                                        })(dataset),
                                        condition : state.transitions[i].condition
                                    });
                                }
                            }
                        }
                    }
                });
                var svg = createSVG("#svg_container"),
                    force = createForceLayout(svg,dataset,links);

                createPaths(svg,force,dataset,links);
                createCircles(svg,force,dataset,links);

            }else{
                //todo : vue par défaut ? basculer vers le mode creation ?
            }

            //fonction pour positionner les cercles sans coordonnées
            function setPositions(cpt){
                //here goes the code of the jeanseba
                return cpt*50+20;
            }
        }
    }
});
