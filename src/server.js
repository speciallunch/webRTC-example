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
  // ws에서 message.type으로 구분하던것에서 event custom 가능
  socket.on("enter_room", (msg, done) => {
    console.log(msg);
  });
});

const handleListen = () => {
  console.log("Listening on http://localhost:3000");
  // console.log("Listening on ws://localhost:3000");
};
httpServer.listen(3000, handleListen);
