import express from "express";
import http from "http";
import WebSocket from "ws";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => {
  console.log("Listening on http://localhost:3000");
  // console.log("Listening on ws://localhost:3000");
};

function onSocketClose() {
  console.log("Disconnected from the Browser ❌");
}

function onMessage(msg) {
  console.log("msg)", msg.toString());
}

/////////////////////////////////////////////////////////////
const server = http.createServer(app); // http 서버
const wss = new WebSocket.Server({ server }); // webSocket 서버. 인자로 http server를 넣어서 둘 다 쓸 수 있도록 함.
// 이렇게 함으로써 한 포트에 http & ws 둘 다 관리 가능

/**
 * @param {string} event connection / error / headers / listening / close
 * @param {*} socket  socket은 연결된 브라우저, 사람과 브라우저 사이와의 연결. WebSocket은 서버와 브라우저 사이의 연결.
 */
wss.on("connection", (socket) => {
  console.log("Connected to Server  ✅"); // 누군가가 websocket 서버로 연결을 함.
  socket.send("hello~");
  socket.on("close", onSocketClose);
  socket.on("message", onMessage);
});

// app.listen(3000, handleListen);
server.listen(3000, handleListen);
