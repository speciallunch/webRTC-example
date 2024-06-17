const socket = io(); // io function이 알아서 socket.io를 실행하고 있는 서버를 찾음
// 연결된 socket들도 자동으로 Map으로 관리

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;
let roomName;

function showRoom(msg) {
  console.log(msg);
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room : ${roomName}`;
  const msgForm = room.querySelector("#msg");
  const nickForm = room.querySelector("#nick");
  msgForm.addEventListener("submit", handleMessageSubmit);
  nickForm.addEventListener("submit", handleNicknameSubmit);
}

function addMessage(msg) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = msg;
  ul.appendChild(li);
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#msg input");
  const msg = input.value;
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You: ${msg}`);
  });
  input.value = "";
}

function handleNicknameSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#nick input");
  socket.emit("nickname", input.value);
  input.value = "";
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");

  /**
   * socket.emit(eventName[, ...args][, ack])
   * @param {string | symbol } eventName
   * @param {any[]} args ws와 달리
   * @param {Function} ack 콜백
   * @returns {true}
   * ws에서 socket.send. ws처럼 makemessage(json<->string) 필요 없이 객체로 전달 가능
   * string뿐만 아니라 number, 객체 등 2개 이상 보낼 수 있다
   */
  socket.emit(
    "enter_room",
    input.value,
    { payload: input.value },
    5,
    "hello",
    false,
    showRoom
  );
  roomName = input.value;
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user) => {
  addMessage(`[${user} joined!]`);
});

socket.on("bye", (user) => {
  addMessage(`[${user} left]`);
});

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  roomList.innerHTML = "";
  if (rooms.length === 0) {
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});
