/* eslint-disable no-console */

//  import connetToLanding from './landingSocket.js';

const socketConnection = (io) => {
  io.users = [];
  io.room = [];
  io.on('connection', (socket) => {
    // connetToLanding(socket);
    // console.log('One user connected');

    socket.on('join', (roomid) => {
      // console.log('JOIN -------------', roomid);
      socket.join(roomid);
    });

    // disconnect from server
    socket.on('disconnect', () => {
      try {
        console.log(
          'disconnected',
          socket.id,
          socket.customId,
          socket.customRoom
        );

        const lastSockets = io.users;
        const filteredSockets = lastSockets.filter(
          (el) => el === socket.customId
        );
        const roomid = io.room;
        const filteredRoom = roomid.filter(
          (el) => el.room === socket.customRoom
        );
        if (filteredSockets.length > 0 && filteredRoom.length > 0) {
          const indexUser = lastSockets.indexOf(socket.customId);
          if (indexUser !== -1) lastSockets.splice(indexUser, 1);

          io.users = lastSockets;

          const data = {
            roomid: socket.customRoom,
            userId: socket.customId,
            tableId: socket.customRoom,
          };

          setTimeout(async () => {
            const dd = { ...data };
            if (io.users.find((ele) => ele === dd.userId)) {
              console.log('reconnected =>', dd);
            } else {
              console.log('exit room called after 300000 milli sec');
              // offline
            }
          }, 120000);
        }
      } catch (e) {
        console.log('error in disconnect block', e);
      }
    });
  });
};

export default socketConnection;
