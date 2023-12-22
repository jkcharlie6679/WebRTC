import * as socketio from "socket.io";
import fs from "fs";
import express from "express";
import * as https from "https";
import * as router from "./router.js";
import * as socket from "./socket.js";

const options = {
  key: fs.readFileSync("./ssl/server.key"),
  cert: fs.readFileSync("./ssl/server.crt"),
};

let app = express();
let server = https.createServer(options, app);
let io = new socketio.Server(server, {
  cors: {
    origin: "*",
  },
});

server.listen(3000, "0.0.0.0", () => {
  console.log("Lestion on 3000 port.");
});

router.route(app);
socket.socket(io);
