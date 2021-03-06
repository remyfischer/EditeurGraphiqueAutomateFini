define(function(require){
    return{
        init: function(svg,force,getData,links){
            var delete_state = require("editmode/delete_state"),
                delete_references = require("editmode/delete_references"),
                add_transition = require("editmode/add_transition"),
                context_menu = require("menu/context_menu");

            //iterates over svg circles (representing states)
            d3.selectAll("circle").each(function(){
                //on right click, call a context menu to delete or edit state
                d3.select(this).on("contextmenu",function(d){
                    switch (context_menu) {
                        case "delete":
                            deleteState(d);
                            break;
                        default:
                            deleteState(d);
                    }
                });
                //on double click, select a state
                //on a second double click on a state, create a link between them
                //(can be the same state, source state cannot be terminal)
                d3.select(this).on("dblclick",function(d){
                    createTransition(d);
                });
            });
            //delete state w/ confirmation
            function deleteState(d){
                d3.event.preventDefault();
                swal({
                    title: "Delete this state?",
                    text: "Transition related to this state will be deleted too",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, delete it",
                    closeOnConfirm: false
                },function(){
                    delete_state(d.index,{svg,force,getData,links});
                    delete_references(d.name,getData);
                    swal("Deleted!", "The state \""+d.name+"\" has been deleted.", "success");
                });
            }
            //create a new link
            function createTransition(d){
                d3.event.preventDefault();
                var linkingTest = false,
                    thisID = "#state_"+d.index;
                var create_path = require("editmode/create_path");

                d3.selectAll("circle").each(function(d){    //testing if a first state is selected (being linked)
                    if(d.graphicEditor.linking){
                        linkingTest=d;
                    }
                });
                if(linkingTest){    //if a first state is selected, ask wether cancel or create link then reset linking
                    var linkingTestID = "#state_"+linkingTest.index;
                    d3.select(thisID).classed("linking",true);
                    var swalTransition = swal({
                        title: "Create transition ?",
                        text: "Create transition between states \""+linkingTest.name+"\" and \""+d.name+"\" ?",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Yes, create it",
                        closeOnConfirm: false
                    },function(confirmed){
                        if(confirmed){
                            var condition = "";
                            var swalCondition = swal({
                                title: "Condition",
                                text: "Write a condition for this new transition",
                                type: "input",
                                showCancelButton: true,
                                closeOnConfirm: false,
                                animation: "slide-from-top",
                                inputPlaceholder: "condition"
                            },function(inputValue,confirmed){
                                if (inputValue === false){
                                    //edit visual hints
                                    linkingTest.graphicEditor.linking=false;
                                    d.graphicEditor.linking=false;
                                    d3.select(linkingTestID).classed("linking",false);
                                    d3.select(thisID).classed("linking",false);
                                    return false;
                                }
                                if (inputValue === "") {
                                    swal.showInputError("You need to write a condition");
                                    return false
                                }
                                condition = inputValue;
                                //createPath
                                create_path(svg,force,linkingTest.index,d.index,condition);
                                //add transition to global data object
                                add_transition(linkingTest,d,condition,getData);
                                //edit visual hints
                                linkingTest.graphicEditor.linking=false;
                                d.graphicEditor.linking=false;
                                d3.select(linkingTestID).classed("linking",false);
                                d3.select(thisID).classed("linking",false);
                                //close sweetalert prompt window
                                swal.close();
                            });
                        }else{
                            d.graphicEditor.linking=false;
                            d3.select(thisID).classed("linking",false);
                        }
                    });
                }else{  //first selection of state
                    if(d.terminal){ //disalow w/ an alert if the state is terminal
                        swal({
                            title: "This state is terminal",
                            text: "A terminal states cannot be the source for a new link",
                            type: "warning",
                            showCancelButton: false,
                            confirmButtonColor: "#DD6B55",
                            confirmButtonText: "OK",
                            closeOnConfirm: true
                        });
                    }else{
                        d.graphicEditor.linking=true;
                        d3.select(thisID).classed("linking",true);
                    }
                }
            }
        }
    }
});
