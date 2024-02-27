// const socket = new WebSocket("http://localhost:3000"); // Failed to construct 'WebSocket': The URL's scheme must be either 'ws' or 'wss'. 'http' is not allowed.
const socket = new WebSocket(`ws://${window.location.host}`); // 서버로의 연결. server.js와의 socket이랑 의미가 다르다
// 연결되면 서버로 "connection" event 전송
const messageList = document.querySelector("ul");
const msgForm = document.querySelector("#message");
const nickForm = document.querySelector("#nick");

//////////////////////////////////////////// utils
function makeMessage(type, payload) {
  const msg = { type, payload };
  return JSON.stringify(msg);
}
////////////////////////////////////////////

socket.addEventListener("open", () => {
  console.log("Connected to Server ✅");
});

socket.addEventListener("message", (msg) => {
  const li = document.createElement("li");
  li.innerText = msg.data;
  messageList.append(li);
});

socket.addEventListener("close", (msg) => {
  console.log("Disconnected from Server ❌");
});

const handleNickSubmit = (event) => {
  console.log("handleNickSubmit");
  event.preventDefault();
  const input = nickForm.querySelector("input");
  socket.send(makeMessage("nickname", input.value));
  input.value = "";
};

// TODO: 시스템 메시지 등을 위해 프론트에서도 parsing해야되는 등 작업이 많이 필요하다 -> 새로운 framework가 필요
// TODO: 본인 빼고 다른 유저에게 보내고 싶으면?
const handleMsgSubmit = (event) => {
  console.log("handleMsgSubmit");
  event.preventDefault(); // submit 이벤트가 발생하면 page reload되는걸 방지
  const input = msgForm.querySelector("input");
  socket.send(makeMessage("message", input.value));
  input.value = "";
};

nickForm.addEventListener("submit", handleNickSubmit);
msgForm.addEventListener("submit", handleMsgSubmit); // <form> 요소 자체에서 button 클릭 시 event fires.
