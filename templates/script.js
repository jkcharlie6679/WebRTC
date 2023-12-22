let socketio = io("https://127.0.0.1:3000");

const constraints = {
  audio: false,
  video: {
    width: { min: 1024, ideal: 1280, max: 1920 },
    height: { min: 576, ideal: 720, max: 1080 },
    facingMode: "user",
  },
};

const configuration = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
    {
      url: "turn:192.158.29.39:3478?transport=udp",
      credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
      username: "28224511:1379330808",
    },
  ],
};

const localVideo = document.querySelector("#localVideo");
const remoteVideo = document.querySelector("#remoteVideo");
const startBtn = document.querySelector("#startBtn");
const callBtn = document.querySelector("#callBtn");
const answerBtn = document.querySelector("#answerBtn");

let localStream;
let localPeer = new RTCPeerConnection(configuration);
let remoteStream;

startBtn.addEventListener("click", async () => {
  await navigator.mediaDevices.getUserMedia(constraints).then((mediaStream) => {
    localVideo.srcObject = mediaStream;
    localStream = mediaStream;
  });

  localPeer.onicecandidate = (event) => {
    socketio.emit("candidate", event.candidate);
  };

  localStream.getTracks().forEach((track) => {
    localPeer.addTrack(track, localStream);
  });

  localPeer.ontrack = (event) => {
    remoteVideo.srcObject = event.streams[0];
  };
});

callBtn.addEventListener("click", async () => {
  localPeer.createOffer().then((offer) => {
    localPeer.setLocalDescription(offer).then(() => {
      socketio.emit("offer", localPeer.localDescription);
    });
  });
  socketio.on("answer", (data) => {
    localPeer.setRemoteDescription(data);
  });
  socketio.on("candidate", (data) => {
    console.log(data);
    const icdcandidate = new RTCIceCandidate(data);
    localPeer.addIceCandidate(icdcandidate);
  });
});

answerBtn.addEventListener("click", () => {
  socketio.emit("askCandidate");
  socketio.on("returnCandidate", (data) => {
    data.forEach((candidate) => {
      const icdcandidate = new RTCIceCandidate(candidate);
      localPeer.addIceCandidate(icdcandidate);
    });
  });
  socketio.emit("askOffer");
  socketio.on("returnOffer", (data) => {
    localPeer.setRemoteDescription(data);
    localPeer.createAnswer().then((answer) => {
      localPeer.setLocalDescription(answer).then(() => {
        socketio.emit("answer", localPeer.localDescription);
      });
    });
  });
});
