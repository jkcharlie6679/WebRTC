let socketio = io("https://192.168.0.104:3000");

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

const roomIdInput = document.querySelector("#roomId");
const localVideo = document.querySelector("#localVideo");
const remoteVideo = document.querySelector("#remoteVideo");
const startBtn = document.querySelector("#startBtn");
const callBtn = document.querySelector("#callBtn");
const answerBtn = document.querySelector("#answerBtn");

let roomId;
let localStream;
let localPeer = new RTCPeerConnection(configuration);
let remoteStream;

startBtn.addEventListener("click", async () => {
  startBtn.disabled = true;
  callBtn.disabled = false;
  answerBtn.disabled = false;
  await navigator.mediaDevices.getUserMedia(constraints).then((mediaStream) => {
    localVideo.srcObject = mediaStream;
    localStream = mediaStream;
  });

  localPeer.onicecandidate = (event) => {
    let data = {
      roomId: roomId,
      data: event.candidate,
    };
    socketio.emit("candidate", data);
  };

  localStream.getTracks().forEach((track) => {
    localPeer.addTrack(track, localStream);
  });

  localPeer.ontrack = (event) => {
    remoteVideo.srcObject = event.streams[0];
  };
});

callBtn.addEventListener("click", async () => {
  callBtn.disabled = true;
  answerBtn.disabled = true;
  socketio.emit("joinRoom", null);

  socketio.on("returnRoomId", (data) => {
    roomIdInput.value = data;
    roomId = data;

    localPeer.createOffer().then((offer) => {
      localPeer.setLocalDescription(offer).then(() => {
        let data = {
          roomId: roomId,
          data: localPeer.localDescription,
        };
        socketio.emit("offer", data);
      });
    });

    socketio.on("answer", (data) => {
      localPeer.setRemoteDescription(data);
    });

    socketio.on("candidate", (data) => {
      const icdcandidate = new RTCIceCandidate(data);
      localPeer.addIceCandidate(icdcandidate);
    });
  });
});

answerBtn.addEventListener("click", () => {
  callBtn.disabled = true;
  answerBtn.disabled = true;
  socketio.on("full", () => {
    alert("The room is full");
    callBtn.disabled = false;
    answerBtn.disabled = false;
  });
  roomId = roomIdInput.value;
  socketio.emit("joinRoom", roomId);
  socketio.emit("askCandidate", roomId);
  socketio.on("returnCandidate", (data) => {
    data.forEach((candidate) => {
      try {
        const icdcandidate = new RTCIceCandidate(candidate);
        localPeer.addIceCandidate(icdcandidate);
      } catch {}
    });
    socketio.emit("askOffer", roomId);
    socketio.on("returnOffer", (data) => {
      localPeer.setRemoteDescription(data);
      localPeer.createAnswer().then((answer) => {
        localPeer.setLocalDescription(answer).then(() => {
          let data = {
            roomId: roomId,
            data: localPeer.localDescription,
          };
          socketio.emit("answer", data);
        });
      });
    });
  });
});
