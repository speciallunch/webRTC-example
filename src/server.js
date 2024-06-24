import express from "express";
import https from "https";
import http from "http";
import SoketIO from "socket.io";
import fs from "fs";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

/////////////////////////////////////////////////////////////
var options = {
  key: fs.readFileSync("cert.key"),
  cert: fs.readFileSync("cert.crt"),
};
const httpServer = http.createServer(app); // http 서버
// const httpServer = https.createServer(options, app); // https 서버
const wsServer = SoketIO(httpServer);

wsServer.on("connection", (socket) => {
  socket.on("join_room", (roomName) => {
    socket.join(roomName);
    socket.to(roomName).emit("welcome");
  });

  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  });

  socket.on("answer", (answer, roomName) => {
    socket.to(roomName).emit("answer", answer);
  });

  socket.on("ice", (ice, roomName) => {
    socket.to(roomName).emit("ice", ice);
  });
});

const handleListen = () => {
  console.log("Listening on http://localhost:3000");
  // console.log("Listening on https://localhost:3000");
  // console.log("Listening on ws://localhost:3000");
};
httpServer.listen(3000, handleListen);
