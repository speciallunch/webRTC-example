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
const wsServer = SoketIO(httpServer);

wsServer.on("connection", (socket) => {
  socket.on("join_room", (roomName) => {
    socket.join(roomName);
    socket.to(roomName).emit("welcome");
  });

  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  });
});

const handleListen = () => {
  console.log("Listening on http://localhost:3000");
  // console.log("Listening on ws://localhost:3000");
};
httpServer.listen(3000, handleListen);
