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
const sockets = [];

/**
 * WebSocket.Server.on
 * @param {string} event connection / error / headers / listening / close
 * @param {*} socket  socket은 연결된 브라우저, 사람과 브라우저 사이와의 연결. WebSocket은 서버와 브라우저 사이의 연결.
 */
wss.on("connection", (socket) => {
  sockets.push(socket); // socket 연결 될 때마다 관리
  socket["nickname"] = "Anonymous";

  console.log("Connected to Server  ✅"); // 누군가가 websocket 서버로 연결을 함.

  /**
   * WebSocket.on
   * @param {string} event close / error / upgrade / message / open / ping|pong / unexpected-response
   * @param {*} socket  socket은 연결된 브라우저, 사람과 브라우저 사이와의 연결. WebSocket은 서버와 브라우저 사이의 연결.
   */
  socket.on("close", onSocketClose);
  socket.on("message", (msg) => {
    const message = JSON.parse(msg); // string -> js object
    switch (message.type) {
      case "message":
        sockets.forEach((aSocket) =>
          aSocket.send(`[${socket.nickname}] ${message.payload}`)
        ); // 모든 socket들에게 send
        break;
      case "nickname":
        console.log(socket.nickname, "'s nick changed", message.payload);
        socket["nickname"] = message.payload;
        break;
    }
  });
});

// app.listen(3000, handleListen);
server.listen(3000, handleListen);
