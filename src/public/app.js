// const socket = new WebSocket("http://localhost:3000"); // Failed to construct 'WebSocket': The URL's scheme must be either 'ws' or 'wss'. 'http' is not allowed.
const socket = new WebSocket(`ws://${window.location.host}`); // 서버로의 연결. server.js와의 socket이랑 의미가 다르다

socket.addEventListener("open", () => {
  console.log("Connected to Server ✅");
});

socket.addEventListener("message", (msg) => {
  console.log("message received:", msg.data);
});

socket.addEventListener("close", (msg) => {
  console.log("Disconnected from Server");
});
