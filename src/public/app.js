const socket = io(); // io function이 알아서 socket.io를 실행하고 있는 서버를 찾음
// 연결된 socket들도 자동으로 Map으로 관리

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");

  // ws에서 socket.send. ws처럼 makemessage(json<->string) 필요 없이 객체로 전달 가능
  // callback도 사용 가능
  socket.emit("enter_room", { payload: input.value }, () => {
    console.log("server is DONE");
  });
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);
