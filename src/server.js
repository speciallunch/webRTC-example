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

function publicRooms() {
  // const sids = wsServer.sockets.adapter.sids;
  // const rooms = wsServer.sockets.adapter.rooms;
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      // room ID를 socket ID에서 찾을 수 없다면, public room!
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

wsServer.on("connection", (socket) => {
  socket["nickname"] = "Anonymous"; // ※ JS Bracket Notation

  //Adds a listener that will be fired when any event is emitted.
  socket.onAny((event) => {
    console.log(wsServer.sockets.adapter); // 따로 설정 안하면 memony상에 존재 -> mongoDB로 교체해보자
    console.log(`['${event}' Event]`);
  });

  /**
   * socket.on(eventName, callback)
   * @param {string | symbol } eventName
   * @param {Function} callback
   * @returns {Socket}
   * e.g. socket.on("news", (data, callback) => {})
   */
  socket.on("enter_room", (roomName, a, b, c, d, done) => {
    socket.join(roomName);
    done("hello from the backend"); // back-end에서 실행시키는게 아니라, front-end에서 실행시키는 것!
    socket.to(roomName).emit("welcome", socket.nickname);
    // ws server emit은 방 모두에게 보내는 emit
    wsServer.sockets.emit("room_change", publicRooms());
  });

  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
    done(); // front-end에서 실행시키는 것!
  });

  socket.on("nickname", (nickname) => {
    socket["nickname"] = nickname;
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit("bye", socket.nickname);
    });
  });

  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  });
});

const handleListen = () => {
  console.log("Listening on http://localhost:3000");
  // console.log("Listening on ws://localhost:3000");
};
httpServer.listen(3000, handleListen);
