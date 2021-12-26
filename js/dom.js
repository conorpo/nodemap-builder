const nodeInfo = {color:document.getElementById("node-color"),radius:document.getElementById("node-radius")
,x:document.getElementById("node-x"),y:document.getElementById("node-y"),name:document.getElementById("node-name"),
floor:document.getElementById('node-floor'),type:document.getElementById('node-type'),class:document.getElementById('node-class')};
var connection = {first:null,second:null};
var scaleR=1;
canvas.onwheel = function(){ return false; }
nodeInfo.color.addEventListener('change', function(evt){
    if(selectedNode != null){
        for(i of selectedNode){
            nodes[i].color = nodeInfo.color.value;
        }
    }
},false);
nodeInfo.radius.addEventListener('change', function(evt){
    if(selectedNode != null){
        for(i of selectedNode){
            nodes[i].radius = Number(nodeInfo.radius.value);
        }
    }
},false);
nodeInfo.x.addEventListener('change', function(evt){
    if(selectedNode != null){
        for(i of selectedNode){
            nodes[i].x = Number(nodeInfo.x.value);
        }
    }
},false);
nodeInfo.y.addEventListener('change', function(evt){
    if(selectedNode != null){
        for(i of selectedNode){
            nodes[i].y = Number(nodeInfo.y.value);
        }
    }
},false);
nodeInfo.name.addEventListener('change', function(evt){
    if(selectedNode != null){
        for(i of selectedNode){
            nodes[i].name = nodeInfo.name.value;
        }
    }
},false);
nodeInfo.type.addEventListener('change', function(evt){
    if(selectedNode !=null){
        for(i of selectedNode){
            nodes[i].type = nodeInfo.type.selectedIndex;
            if(nodes[i].type == 0){
                nodes[i].floor = floor;
                nodes[i].color = "#008000";
            }
            else if(nodes[i].type == 2){
                nodes[i].color = "#FF1493";
            }
            else if(nodes[i].type == 1){
                nodes[i].color = "#000080";
            }
        }
        updateSelectedNode(selectedNode);
    }
},false);
nodeInfo.floor.addEventListener('change', function(evt){
    if(Number(nodeInfo.floor.value) < 1){
        nodeInfo.floor.value = 1;
    }
    else if(Number(nodeInfo.floor.value) > Number(document.getElementById("floors").value)){
        nodeInfo.floor.value = document.getElementById("floors").value;
    }
    if(selectedNode != null){
        for(var s of selectedNode){
            if(nodes[s].floor != Number(nodeInfo.floor.value)){
                for(var i = 0;i<paths.length;i++){
                    let path = paths[i];
                    if(path[1] == s || path[0] == s){
                        paths.splice(i,1);
                        i--;
                    }
                }
            }
            nodes[s].floor = Number(nodeInfo.floor.value);
        }
    }
},false);
nodeInfo.class.addEventListener('change',function(evt){
    if(selectedNode != null){
        for(var i of selectedNode){
            nodes[i].class = nodeInfo.class.value;
        }
    }
},false);
document.getElementById('nodeInteraction').addEventListener('change',function(evt){
    setup = document.getElementById('nodeInteraction').selectedIndex;
},false);
canvas.addEventListener('mousedown', function(evt){
    initialCoords = coors;
    if(evt.shiftKey){
        selectionBox.vis = true;
        selectionBox.one = {x:coors.x,y:coors.y};
        selectionBox.two = {x:coors.x,y:coors.y};
    }else{
        var collision = coll();
        if(collision != -1){
            updateSelectedNode([collision]);
            if(setup == 0){
                dragOffset = {x:nodes[collision].x-coors.x, y:nodes[collision].y-coors.y}
                nodeBeingDragged = nodes[collision];
            }
            else if(setup == 1){
                connection.one = collision;
                var tempNewCoords = {x:coors.x,y:coors.y}
                addPath(connection.one);
                drawingPath = paths.length-1;
            }
        }
        else{
            originOffset = {x:coors.ax-currentOrigin.x,y:coors.ay-currentOrigin.y}
            screenBeingDragged = true;
        }
    }
}, false);
canvas.addEventListener('mousemove', function(evt){
    coors = getMousePos(evt,canvas);
    if(screenBeingDragged){
        currentOrigin.x = coors.ax - originOffset.x;
        currentOrigin.y = coors.ay - originOffset.y;
    }
    else if(selectionBox.vis){
        selectionBox.two={x:coors.x,y:coors.y};
    }

}, false)
canvas.addEventListener('mouseup', function(evt){
    if(selectedNode != null){updateSelectedNode(selectedNode)};
    screenBeingDragged = false;
    if(selectionBox.vis){
       var sNodes = []
       for(var i = 0; i<nodes.length;i++){
           node = nodes[i];
           if(node.floor == floor &&
           ((node.x<selectionBox.one.x && node.x>selectionBox.two.x)||(node.x>selectionBox.one.x && node.x<selectionBox.two.x)) &&
           ((node.y<selectionBox.one.y && node.y>selectionBox.two.y)||(node.y>selectionBox.one.y && node.y<selectionBox.two.y))){
               sNodes.push(i);
           }
       }
       if(sNodes.length >= 1){
          updateSelectedNode(sNodes);
       }
       selectionBox.vis=false;
    }
    if(nodeBeingDragged != -1){
        if(document.getElementById("gridsnap").checked){
            nodeBeingDragged.x = (squareSize/currentOrigin.scale/gridInside)*Math.round(coors.x/(squareSize/currentOrigin.scale/gridInside));
            nodeBeingDragged.y = (squareSize/currentOrigin.scale/gridInside)*Math.round(coors.y/(squareSize/currentOrigin.scale/gridInside));
        }
        updateSelectedNode(selectedNode);
        nodeBeingDragged = -1;
    }
    dragOffset = 0;
    var collision = coll();
    var setup = document.getElementById('nodeInteraction').selectedIndex;
    if(setup == 0){
        if (distance(coors.ax,initialCoords.ax,coors.ay,initialCoords.ay) < 25 && collision == -1){
            if(document.getElementById("gridsnap").checked){
                addNode((squareSize/currentOrigin.scale/gridInside)*Math.round(coors.x/(squareSize/currentOrigin.scale/gridInside)),
                (squareSize/currentOrigin.scale/gridInside)*Math.round(coors.y/(squareSize/currentOrigin.scale/gridInside)), 10, '#008000', 'New Node',0,floor);
            }
            else{
                addNode(coors.x, coors.y, 10, '#008000', 'New Node', 0 , floor);
            }
        }
    }
    else if (setup == 1 ){
        collision = coll();
        if (collision != -1 && drawingPath != -1){
            connection.two = collision;
            var duplicate = false;
            for (var path of paths){
                if (connection.one == path[0] && connection.two ==  path[1]){
                    duplicate = true;
                }
                else if(connection.one == path[1] && connection.two == path[0]){
                    duplicate = true;
                }
                else if(connection.one == connection.two){
                    duplicate = true;
                    updateSelectedNode([connection.one]);
                }
            }
            if(!duplicate){
                paths[drawingPath].push(connection.two);
            }
            else{
                paths.pop();
            }
        }
        else if(drawingPath != -1){
            paths.pop();

        }
        drawingPath = -1;
    }
    else if (setup == 2){
        var deleted = coll();
        var pDeleted = pColl();
        if (deleted != -1){
            if(selectedNode == deleted){
                selectedNode = null;
            }
            for(var i = 0;i<paths.length;i++){
                var path = paths[i];
                if(path[0] == deleted || path[1] == deleted){
                    paths.splice(i,1);
                    i--;
                }else if(path[0]>deleted){
                    path[0]--;
                }else if(path[1]>deleted){
                    path[1]--;
                }
            }
            nodes.splice(deleted,1);
        }else if(pDeleted != -1){
            paths.splice(pDeleted,1);
        }
    }
}, false)
canvas.addEventListener('wheel',function(evt){
    let oldScale = currentOrigin.scale;
    if(evt.deltaY>0 && currentOrigin.scale/1.05 > 0.01){
        currentOrigin.scale/=1.05;
    }
    else if(evt.deltaY<0 && currentOrigin.scale * 1.05 < 10){
        currentOrigin.scale*=1.05;
    }
    let scaleChange = currentOrigin.scale - oldScale;
    currentOrigin.x-=(coors.x*scaleChange);
    currentOrigin.y-=(coors.y*scaleChange);

    //For Grid
    scaleR=Math.pow(10,Math.floor(Math.log10(currentOrigin.scale)));
    var squareSizeT=10/(currentOrigin.scale/scaleR);
    if(squareSizeT>5 && squareSizeT<=10){
        squareSize=100/scaleR;
        gridInside=5;
    }
    else if(squareSizeT>2 && squareSizeT<=5){
        squareSize=50/scaleR;
        gridInside=5;
    }
    else{
        squareSize=20/scaleR;
        gridInside=4;
    }
    squareSize *= currentOrigin.scale;
},false)
document.getElementById("imageFile").addEventListener('change',function(evt){
    backgroundImage = document.createElement("img");
    backgroundImage.src = window.URL.createObjectURL(document.getElementById("imageFile").files[0]);
},false);
$(document).keydown(function(e) {
    if (document.activeElement.tagName!="INPUT"){
    switch(e.which){
        case 37: // left
        translateCanvas(-1,0);
        break;
        case 38: // up
        translateCanvas(0,-1);
        break;
        case 39: // right
        translateCanvas(1,0);
        break;
        case 40: // down
        translateCanvas(0,1);
        break;
        case 73:
        scaleCanvas(true);
        break;
        case 79:
        scaleCanvas(false);
        break;
        case 78:
        document.getElementById("nodeInteraction").value = "Placing Nodes";
        break;
        case 67:
        document.getElementById("nodeInteraction").value = "Making Connections";
        break;
        case 68:
        document.getElementById("nodeInteraction").value = "Deleting Elements";
        break;
        default: return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
    }
});
function updateSelectedNode(index){
    selectedNode = index;
    document.getElementById("selected").innerHTML = index.length;
    nodeInfo.floor.parentNode.style.display = "inline";
    nodeInfo.class.parentNode.style.display = "inline";
    for(prop in nodeInfo){
        let dProp = 'value';
        if(prop == 'type'){
            dProp = 'selectedIndex';
        }
        let val = nodes[index[0]][prop];
        let dif = false;
        for(i of index){
            if (nodes[i][prop] != val){
                dif = true;
            }
        }
        if(dif){
            nodeInfo[prop][dProp] = "~";
            if(prop =='type'){
                nodeInfo.class.parentNode.style.display = "none";
                nodeInfo.floor.parentNode.style.display = "none";
            }
        }
        else{
            nodeInfo[prop][dProp] = val;
        }
    }
}
