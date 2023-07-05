/* eslint-disable import/no-extraneous-dependencies */
import openSocket from 'socket.io-client';
// import { getAllGame } from '../controller/tournamentController';
// import tournamentModel from '../models/tournament';
// https://dev-api.scrooge.casino
// http://localhost:3004

const connetToLanding = () => {
     console.log('Poker socket', process.env.LANDING_API_URL);
    const socket = openSocket(process.env.LANDING_API_URL, {
        transports: ['websocket'],
        rejectUnauthorized: false,
    });
    socket.on('connect', () => {
         console.log('conected to landing server server');
    });
    // console.log('dfdfdfdfdfdfdfdfdfdfdfdfdfdfdfdfdfdfdfdf', process.env.LANDING_API_URL);
    socket.emit('salutations', 'Hello!', { mr: 'john' }, Uint8Array.from([1, 2, 3, 4]));
    // socket.on('tournamentAction', async (data) => {
    //      const getAllTournament = await tournamentModel.find({}).populate('rooms');
    //      console.log('tournament created at landing');
    //      pokerSocket.emit('tournamentCreated', { tournaments: getAllTournament });
    // });
//     socket.on('tableCreate', async (data) => {
//         pokerSocket.emit('AllTables', { tables: data?.tables });
//    });

    const tryReconnect = () => {
        setTimeout(() => {
            socket.io.open((err) => {
                if (err) {
                    tryReconnect();
                }
            });
        }, 2000);
    };

    socket.io.on('close', tryReconnect);
    return socket;
};

export default connetToLanding;
