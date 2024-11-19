import { setEnvironmentData } from "worker_threads";

const socket = new WebSocket("ws://localhost:8080");

socket.addEventListener("open", (event) => {
  socket.send("Hello Server!");
});

socket.addEventListener("message", (event) => {
  console.log("Message from server ", event.data);
});

window.onload = setButtonEvents;


function sendMessage(text){
    socket.send(text);
    console.log("should be sent")
}

function setButtonEvents(){
  let inputFile = document.getElementsByTagName("input")[0];
  let btnList = document.getElementsByTagName("button");
  console.log(btnList.length);

  for(let i = 0; i < btnList.length; i++){
    btnList[i].addEventListener("click",() => {
      awaitConv(inputFile);
    });
}
}

async function awaitConv(inputFile){
  if(inputFile.files != null){
    const file = await inputFile.files[0].arrayBuffer();
    socket.send(file);
  }
}