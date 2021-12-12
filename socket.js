export let socket = (io) => {
  let roomList = {};

  io.on('connection', (conn) => {
    conn.on('joinRoom', (event) => {
      if (event === null) {
        let roomId = Date.now();
        roomId = roomId.toString();
        roomList[roomId] = [{ memeber: 1, offer: '', answer: '', candidate: [] }];
        conn.join(roomId);
        conn.emit('returnRoomId', roomId);
      } else {
        let roomMember;
        try {
          roomMember = roomList[event][0]['memeber'];
        } catch (error) {
          roomMember = null;
        }
        if (roomMember !== null && roomMember < 2) {
          roomList[event][0]['memeber'] = 2;
          conn.join(event);
        } else {
          conn.emit('full');
        }
      }
    });

    conn.on('offer', (event) => {
      roomList[event.roomId][0]['offer'] = event.data;
    });

    conn.on('answer', (event) => {
      roomList[event.roomId][0]['answer'] = event.data;
      conn.to(event.roomId).emit('answer', event.data);
    });

    conn.on('askOffer', (event) => {
      conn.emit('returnOffer', roomList[event][0]['offer']);
    });

    conn.on('candidate', (event) => {
      if (event.data != null) {
        roomList[event.roomId][0]['candidate'].push(event.data);
        conn.to(event.roomId).emit('candidate', event.data);
      }
    });

    conn.on('askCandidate', (event) => {
      conn.emit('returnCandidate', roomList[event][0]['candidate']);
      roomList[event][0]['candidate'] = [];
    });
  });
};
