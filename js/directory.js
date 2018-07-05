var classrooms = [];
function addNewClass(){
    var classroom = document.getElementById("classroom").value;
    //Make sure not empty, get rid of whitespace, remove duplicate
    if(classroom != "" && classroom !== null){
        classroom = classroom.trim();
        if(classrooms.indexOf(classroom) == -1){
            var listItem = document.createElement("DIV");
            listItem.className = "classroom";
            var text = document.createElement("H3");
            text.innerHTML = classroom;
            var deleteButton = document.createElement("BUTTON");
            deleteButton.innerHTML = "X";
            deleteButton.addEventListener("click",function(evt){
                var index = classrooms.indexOf(evt.currentTarget.parentNode.children[0].innerText);
                classrooms.splice(index,1);
                evt.currentTarget.parentNode.parentNode.removeChild(evt.currentTarget.parentNode);
                for(var i = 0; i < nodeInfo.class.children.length;i++){
                    var child = nodeInfo.class.children[i];
                    if(child.innerText == evt.currentTarget.parentNode.children[0].innerText){
                        nodeInfo.class.removeChild(child);
                    }
                }
            },false);
            listItem.appendChild(text);
            listItem.appendChild(deleteButton);
            document.getElementById("classes").appendChild(listItem);
            classrooms.push(classroom);
            //Create Option for select inside node Infp
            var option = document.createElement("OPTION");
            option.innerHTML = classroom;
            nodeInfo.class.appendChild(option);

        }else{
            alert("You already have this class in your list");
        }
    }
}
document.getElementById("classroom").addEventListener('keyup',function(event){
    event.preventDefault();
    if(event.keyCode === 13){
        addNewClass();
    }
})
