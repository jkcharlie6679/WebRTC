import fs from "fs";
import express from "express";
import { Server } from "socket.io";
import https from "https";
import router from "./router.js";
import socket from "./socket.js";

const options = {
  key: fs.readFileSync("./ssl/server.key"),
  cert: fs.readFileSync("./ssl/server.crt"),
};

let app = express();
let server = https.createServer(options, app);
let io = new Server(server, {
  cors: {
    origin: "*",
  },
});

server.listen(3000, "0.0.0.0", () => {
  console.log("Lestion on 3000 port.");
});

socket(io);
router(app);

