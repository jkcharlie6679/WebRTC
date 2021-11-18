let socketio = io();

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
const username = document.querySelector("#username");
const localVideo = document.querySelector("#localVideo");
const remoteVideo = document.querySelector("#remoteVideo");
const startBtn = document.querySelector("#startBtn");
const callBtn = document.querySelector("#callBtn");
const answerBtn = document.querySelector("#answerBtn");
const sendBtn = document.querySelector("#sendBtn");
const chat = document.querySelector("#chat");
const chatText = document.querySelector("#chatText");

let roomId;
let localUsername;
let remoteUsername;
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
  if (username.value === "") {
    localUsername = "caller";
  } else {
    localUsername = username.value;
  }
  username.value = localUsername;
  username.disabled = true;

  let dataChannel = localPeer.createDataChannel("chat");
  dataChannel.onopen = (event) => {
    dataChannel.send(localUsername);
    sendBtn.addEventListener("click", () => {
      dataChannel.send(chatText.value);
      chat.innerHTML = chat.innerHTML + `<div class="send">${chatText.value}</div>`;
      chatText.value = "";
    });
  };
  dataChannel.onmessage = (event) => {
    if (remoteUsername === undefined) {
      remoteUsername = event.data;
      chat.innerHTML = chat.innerHTML + `<div class="revice">${event.data} join</div>`;
    } else {
      chat.innerHTML = chat.innerHTML + `<div class="revice">${event.data}</div>`;
    }
  };
  callBtn.disabled = true;
  answerBtn.disabled = true;
  socketio.emit("joinRoom", null);

  socketio.on("returnRoomId", (data) => {
    roomIdInput.value = data;
    roomIdInput.disabled = true;
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
  if (username.value === "") {
    localUsername = "answer";
  } else {
    localUsername = username.value;
  }
  username.value = localUsername;
  username.disabled = true;

  localPeer.ondatachannel = (event) => {
    let dataChannel = event.channel;

    dataChannel.onopen = (event) => {
      dataChannel.send(localUsername);
      sendBtn.addEventListener("click", () => {
        dataChannel.send(chatText.value);
        chat.innerHTML = chat.innerHTML + `<div class="send">${chatText.value}</div>`;
        chatText.value = "";
      });
    };

    dataChannel.onmessage = (event) => {
      if (remoteUsername === undefined) {
        remoteUsername = event.data;
        chat.innerHTML = chat.innerHTML + `<div class="revice">${event.data} join</div>`;
      } else {
        chat.innerHTML = chat.innerHTML + `<div class="revice">${event.data}</div>`;
      }
    };
  };

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
