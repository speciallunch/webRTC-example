import express from "express";
import http from "http";
import SoketIO from "socket.io";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

/////////////////////////////////////////////////////////////
const httpServer = http.createServer(app); // http 서버
const wsServer = SoketIO(httpServer); // ws 서버
// http://localhost:3000/socket.io/socket.io.js

wsServer.on("connection", (socket) => {
  //Adds a listener that will be fired when any event is emitted.
  socket.onAny((event) => {
    console.log(`['${event}' Event]`);
  });
  
  // ws에서 message.type으로 구분하던것에서 event custom 가능
  socket.on("enter_room", (roomName, a, b, c, d, done) => {
    console.log(socket.id);
    console.log(socket.rooms); // 기본적으로 User와 서버 사이의 soket.id를 룸이름으로 하는 private room이 있다 
    setTimeout(() => {
      done("hello from the backend"); //  back-end에서 실행시키는게 아니라, front-end에서 실행시키는 것!
      // backend에서 실행시키면 보안문제가 생길 것! 
    }, 3000);
  });
});

const handleListen = () => {
  console.log("Listening on http://localhost:3000");
  // console.log("Listening on ws://localhost:3000");
};
httpServer.listen(3000, handleListen);
