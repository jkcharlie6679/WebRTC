export let socket = (io) => {
  let offer;
  let answer;
  let candidate = [];
  io.on("connection", (conn) => {
    conn.on("offer", (event) => {
      offer = event;
    });
    conn.on("answer", (event) => {
      answer = event;
      io.emit("answer", answer);
    });
    conn.on("askOffer", () => {
      conn.emit("returnOffer", offer);
    });
    conn.on("candidate", (data) => {
      candidate.push(data);
      conn.broadcast.emit("candidate", data);
    });
    conn.on("askCandidate", () => {
      conn.emit("returnCandidate", candidate);
      candidate = [];
    });
  });
};
