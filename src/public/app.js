const socket = io(); // io function이 알아서 socket.io를 실행하고 있는 서버를 찾음
// 연결된 socket들도 자동으로 Map으로 관리

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById('room');

room.hidden = true;
let roomName;

function showRoom(msg) {
  console.log(msg);
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector('h3');
  h3.innerText = `Room : ${roomName}`
}  
  
function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");

  // ws에서 socket.send. ws처럼 makemessage(json<->string) 필요 없이 객체로 전달 가능
  // string뿐만 아니라 number, 객체 등 2개 이상 보낼 수 있다
  // 오래걸리는 작업을 callback형식으로도 전달 가능 (대신 무조건 마지막 순서의 인자로 넣어야 함)
  socket.emit("enter_room", input.value, { payload: input.value }, 5, 'hello', false, showRoom);
  roomName = input.value;
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);
