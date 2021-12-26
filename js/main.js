var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');
var currentOrigin = {x:800,y:500,scale:1};
var coors = {x:0,y:0,ax:0,ay:0}
var dragOffset = {x:0,y:0}
var nodeBeingDragged = -1;
var nodes = [];
var paths = [];
var initialCoords;
var screenBeingDragged = false;
var drawingPath = -1;
var squareSize = 100;
var gridInside = 4;
var selectedNode;
var setup = 0;
var floor = 1;
var saveTemp;
var selectionBox={one:0,two:0,vis:false};
var saveStr;
function init(){
    document.getElementById("defaultOpen").click();
    canvas.width = 1600;
    canvas.height = 1000;
    ctx.textBaseline="middle";
    ctx.textAlign="center";
    ctx.font="20px Arial"
    ctx.lineWidth = 1;
    if(window.confirm("Need info on controls?")){
        let alertM = 'Drag or Arrow keys to move, Scroll or I and O to zoom,'+
        'Click to place elements, select elements, and deleted them,'+
        'Drag to move screen, move elements, make connections,'+
        'Shift+Drag to select multiple element';
        window.alert(alertM)
    };
    var drawLoop = setInterval(draw,20);
}
function coll(){
    for (var i = nodes.length-1; i>=0; i--){
        var node = nodes[i];
        if(node.floor == floor){
            var dist = distance(coors.x,node.x, coors.y, node.y);
            if (dist <= Math.pow(node.radius,2)){
              return i;
            }
        }
 }
 return -1;
}
function pColl(){
    for(var i = 0; i < paths.length;i++){
        var path = paths[i];
        if(nodes[path[0]].floor == floor){
            var slope = (nodes[path[0]].y-nodes[path[1]].y)/(nodes[path[1]].x-nodes[path[0]].x);
            var eq = {m:slope,b:-(slope*nodes[path[0]].x)-nodes[path[0]].y};
            var eq2 = {m:-(1/eq.m),b:(coors.x/slope)-coors.y};
            var x = (eq.b-eq2.b)/(eq2.m-eq.m);
            if((x < nodes[path[0]].x && x > nodes[path[1]].x)||(x > nodes[path[0]].x && x < nodes[path[1]].x)){
                if(distance(coors.x,x,coors.y,-(eq2.m*x+eq2.b)) < 25){
                    return i;
                }
            }
        }
    }
    return -1;
}
function distance(x1,x2,y1,y2){
 return Math.pow(x1-x2,2)+Math.pow(y1-y2,2);
}
function draw(){
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.translate(currentOrigin.x,currentOrigin.y);
    if(document.getElementById("grids").checked){
        drawBoard(squareSize/gridInside,false);
        drawBoard(squareSize,true);
        drawAxises();
    }
    ctx.scale(currentOrigin.scale,currentOrigin.scale);
    ctx.save();
    for(var path of paths){
        if(nodes[path[0]].floor == floor){
            ctx.beginPath();
            ctx.moveTo(nodes[path[0]].x,nodes[path[0]].y);
            if(drawingPath == paths.indexOf(path)){
                ctx.lineTo(coors.x,coors.y);
            }else{
                ctx.lineTo(nodes[path[1]].x,nodes[path[1]].y);
            }
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.closePath();
        }
    }
    ctx.restore();
    for(var i = 0; i<nodes.length;i++){
        var node = nodes[i];
        if(node.floor == floor || node.type == 2){
           ctx.save();
           if (node == nodeBeingDragged){
             ctx.shadowColor = "black";
             ctx.shadowOffsetX = 5;
             ctx.shadowOffsetY = 5;
             ctx.shadowBlur = 10;
             node.x = coors.x + dragOffset.x;
             node.y = coors.y + dragOffset.y;
           }
           if (selectedNode == i|| (Array.isArray(selectedNode) && selectedNode.includes(i))){
               ctx.lineWidth = 4;
               ctx.strokeStyle = "brown";
           }
           ctx.beginPath();
           ctx.arc(node.x,node.y,node.radius,0,2*Math.PI);
           ctx.fillStyle = node.color;
           ctx.fill();
           ctx.stroke();
           ctx.closePath();
           ctx.restore();
        }
    }
    if(document.getElementById("backGround").checked && document.getElementById("imageFile").files.length != 0){
        ctx.save();
        ctx.scale(document.getElementById("imageScale").value,document.getElementById("imageScale").value);
        ctx.globalAlpha=document.getElementById("imageOpacity").value;
        ctx.drawImage(backgroundImage,0,0);
        ctx.restore();
    }
    if(selectionBox.vis){
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = "#2222EE";
        ctx.strokeStyle = '#2222EE';
        ctx.fillRect(selectionBox.one.x,selectionBox.one.y,selectionBox.two.x-selectionBox.one.x, selectionBox.two.y-selectionBox.one.y);
        ctx.restore();
    }
}
function drawBoard(squareSize,bold){
    ctx.save();
    ctx.beginPath();
    for (var x = ((currentOrigin.x)%squareSize)-currentOrigin.x; x <= (canvas.width-currentOrigin.x); x += squareSize) {
        ctx.moveTo(x, (-currentOrigin.y));
        ctx.lineTo(x, (canvas.height - currentOrigin.y));
    }
    for (var y = ((currentOrigin.y)%squareSize)-currentOrigin.y; y <= (canvas.height-currentOrigin.y); y += squareSize) {
        ctx.moveTo((-currentOrigin.x), y);
        ctx.lineTo((canvas.width-currentOrigin.x),y);
    }
    ctx.strokeStyle = "#777777";
    ctx.closePath();
    if(bold){
        ctx.lineWidth = 2;
    }
    else{
        ctx.lineWIdth = 1;
    }
    ctx.stroke();
    ctx.restore();
}
function drawAxises(){
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0,(-currentOrigin.y));
    ctx.lineTo(0,(canvas.height - currentOrigin.y));
    ctx.moveTo((-currentOrigin.x),0);
    ctx.lineTo((canvas.width-currentOrigin.x),0);
    ctx.closePath();
    ctx.lineWidth = 4;
    ctx.stroke();
    if(document.getElementById("gridText").checked){
        // X axis
        var tSquare = Math.round(squareSize/currentOrigin.scale);
        for(var x =(currentOrigin.x%squareSize)-currentOrigin.x; x <= canvas.width-currentOrigin.x;x += squareSize){
            if(Math.round(x)==0){
                continue;
            }
            ctx.fillText(Math.round(x/(squareSize))*tSquare,x,22)
        }
        for (var y = ((currentOrigin.y)%squareSize)-currentOrigin.y; y <= (canvas.height-currentOrigin.y); y += squareSize) {
            if(Math.round(y)==0){
                continue;
            }
            ctx.fillText(Math.round(y/(squareSize))*tSquare,-22,y)
        }
        ctx.fillText(0,-20,20);
    }
    ctx.restore();
}
function addNode(xcoord, ycoord, radius, color, name, type,floor){
    nodes.push({classroom:null,x:xcoord, y:ycoord, radius:radius, color:color, name:name, type:type,floor:floor})
    updateSelectedNode([nodes.length-1]);
}
function addPath(index1){
    paths.push([index1]);
}
function getMousePos(evt, canv) {
    var rect = canv.getBoundingClientRect(), // abs. size of element
    scaleX = canv.width / rect.width,    // relationship bitmap vs. element for X
    scaleY = canv.height / rect.height;  // relationship bitmap vs. element for Y

    return {
    x: ((evt.clientX - rect.left) * scaleX - currentOrigin.x)/currentOrigin.scale,   // scale mouse coordinates after they have
    y: ((evt.clientY - rect.top) * scaleY - currentOrigin.y)/currentOrigin.scale,
    ax: (evt.clientX - rect.left) * scaleX,
    ay: (evt.clientY - rect.top) * scaleY  // been adjusted to be relative to element
    }
}
function translateCanvas(dx,dy){ //this moves the canvas
    currentOrigin.x+=dx;
    currentOrigin.y+=dy;
}
function switchTab(evt, tabName,level) {
    // Declare all variables
    var i, tabcontent, tablinks;
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
       tabcontent[i].style.display = "none";
    }
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
       tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
    if(level == 2){
      document.getElementById('nodes').style.display = "block";
      document.getElementById('nodes').className += " active";
    }
    else if(level == 1){
       document.getElementById('node-info').style.display = "block";
       document.getElementById('node-info').className += " active";
    }
    if(tabName == 'export'){
        exportPreview();
    }
}
function changeFloor(df){
    if(Number(document.getElementById('floor').value) < 1){
        document.getElementById('floor').value = 1;
    }
    else if(Number(document.getElementById('floor').value) > Number(document.getElementById('floors').value)){
        document.getElementById('floor').value = document.getElementById('floors').value;
    }
    floor = document.getElementById('floor').value;
}
function save(local){
    if(local){
        localStorage.setItem("save",saveStr);
    }else{
        var dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(saveStr);
        var fileName = document.getElementById("fileName").value + ".json";
        document.getElementById("link").setAttribute('href', dataUri);
        document.getElementById("link").setAttribute('download', fileName);
        document.getElementById("link").click();
    }
}
function preload(){
    const reader = new FileReader();
    reader.onload = function(){
        saveTemp = JSON.parse(reader.result);
    };
    reader.readAsText(projectFile.files[0]);
}
function load(local){
    var saveF;
    const projectFile = document.getElementById("projectFile");
    if(local){
        saveF = JSON.parse(localStorage.getItem("save"));
    }else if(projectFile.files.length == 1){
        saveF = saveTemp;
    }
    //Loading
    if(saveF.currentOrigin != null){
        currentOrigin = saveF.currentOrigin;
    }
    if(saveF.paths != null){
        paths = saveF.paths;
    }
    if(saveF.nodes != null){
        nodes = saveF.nodes;
    }
    if(saveF.classrooms != null){
        classrooms = saveF.classrooms;
    }
    if(saveF.gridSettings != null){
        document.getElementById('floors').value = saveF.gridSettings.floors;
        document.getElementById('grids').checked = saveF.gridSettings.grid;
        document.getElementById('gridsnap').checked = saveF.gridSettings.gridSnap;
        document.getElementById('gridText').checked = saveF.gridSettings.gridText;
        document.getElementById('backGround').checked = saveF.gridSettings.backGround;
        document.getElementById('imageScale').value = saveF.gridSettings.bgScale;
        document.getElementById('imageOpacity').value = saveF.gridSettings.bgOpacity;
        if(saveF.gridSettings.squareSize != null){
            squareSize = saveF.gridSettings.squareSize;
            gridInside = saveF.gridSettings.gridInside;
        }
    }
}
function exportPreview(){
    for(var i = 0; i < paths.length; i++){
        var path = paths[i];
        paths[i].push(Math.sqrt(distance(nodes[path[0]].x,nodes[path[1]].x,nodes[path[0]].y,nodes[path[1]].y)));
    }
    var saveF = {
        currentOrigin: currentOrigin,
        nodes: nodes,
        paths: paths,
        classrooms: classrooms,
        gridSettings: {
            floors: document.getElementById('floors').value,
            grid: document.getElementById('grids').checked,
            gridText: document.getElementById('gridText').checked,
            gridSnap: document.getElementById('gridsnap').checked,
            backGround: document.getElementById('backGround').checked,
            bgScale: document.getElementById('imageScale').value,
            bgOpacity: document.getElementById('imageOpacity').value,
            squareSize: squareSize,
            gridInside: gridInside
        }
    };
    console.log(saveF);
    saveStr = JSON.stringify(saveF);
    let nSaveStr = saveStr.split('');
    document.getElementById('textSize').innerHTML = nSaveStr.length + ' characters';
    let indent = 0;
    for(let charI = 0; charI<nSaveStr.length;charI++){
        let char = nSaveStr[charI];
        if(char == '{' || char == '['){
            indent+=2;
        }else if(char == '}' || char == ']'){
            indent-=2;
        }
        if(char == '{' || char == ',' || char == '}' || char == '[' || char == ']'){
            nSaveStr.splice(charI+1,0,'<br>');
            charI++;
            for(let ind = 0; ind < indent; ind++){
                nSaveStr.splice(charI+1,0,'&nbsp;');
                charI++;
            }
        }
    }
    document.getElementById('textPreview').innerHTML = nSaveStr.join('');
}
