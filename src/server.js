import mongoose from 'mongoose'
mongoose.set('useFindAndModify', false);
import express from 'express'
import { WebSocketServer } from "ws"
import cors from 'cors'
import dotenv from 'dotenv';
import passport from 'passport'
import cookieParser from 'cookie-parser'
import bcrypt from 'bcryptjs'
import session from 'express-session'
import bodyParser from 'body-parser'
import User from './models/user.js';
import Game_loop from './models/game_loop.js'
import transactions from './models/transactions.js'
import Stopwatch from 'statman-stopwatch'
import jwtStrategy from './landing-server/config/jwtstragety.js';
import auth from './landing-server/middlewares/auth.js';
import routes from './routes/v1/index.js'
let random_int_0_to_1;
let current_multiplier;
let crashMultipler;
let theLoop;
let right_now;
let crash_number;
dotenv.config();
const app = express();
const sw = new Stopwatch(true);
let ws;

let activeGame = ""; //6481a0509bc43949209593b0
//user1 : '648062937ef0911718ab1690, '648062a87ef0911718ab1692, '648190a0d24f651d88b9b59b'

// io.on("connection", (socket) => {
//     console.log("one user connected", socket.id)
//     socket.on("disconnect", () => {
//         console.log("disconneted")
//     })
// })

// server.listen(process.env.SOCKET_IO_PORT, () => { console.log(`Socket.io server is running on ${process.env.SOCKET_IO_PORT}`) })

const wss = new WebSocketServer({ port: process.env.SOCKET_IO_PORT }, () => {
    console.log("server started");
});

wss.on('connection', (_ws) => {
    ws = _ws;
    ws.send("")
    ws.on('message', (data) => {
        // console.log('object received ' + data);
        ws.send(data.toString())
    });
})

wss.on('listening', () => {
    console.log('socket server is listening on port ', process.env.SOCKET_IO_PORT);
})



// Connect to MongoDB 
mongoose.connect(
    process.env.MONGOOSE_DB_LINK, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
);

// Backend Setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://44.215.0.152',
    'https://pokarz.com',
    'https://admin.pokarz.com',
    'https://plinko.pokarz.com',
    'https://crash.pokarz.com/',
    'https://crash.pokarz.com',
    'https://crash-api-socket.pokarz.com',
  ],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(
    session({
        secret: process.env.PASSPORT_SECRET,
        resave: true,
        saveUninitialized: true,

    })
);
app.use('/v1', routes);
app.use(cookieParser(process.env.PASSPORT_SECRET));
app.use(passport.initialize());
app.use(passport.session());
passport.use('jwt', jwtStrategy);


// app.post('/users', async (req, res) => {
//     try {
//       // Extract user data from the request body
//       const { username, password } = req.body;

//       // Create a new user object based on the schema
//       const newUser = new User({
//         username,
//         password,
//       });

//       // Save the new user to the database
//       const createdUser = await newUser.save();

//       // Return the created user in the response
//       res.status(201).json(createdUser);
//     } catch (error) {
//       // Handle any errors that occur during user creation
//       console.error(error);
//       res.status(500).json({ message: 'Failed to create user' });
//     }
//   });


app.get("/multiply", auth(), async(req, res) => {
    const game_loop = await Game_loop.find({ _id: activeGame });
    const thisUser = await User.findById(req.user._id);
    crashMultipler = game_loop.multiplier_crash
    thisUser.wallet = (thisUser.wallet + crashMultipler)
    await thisUser.save();
    res.json(thisUser);
})

app.get('/generate_crash_value', async(req, res) => {
    const randomInt = Math.floor(Math.random() * 6) + 1
    const game_loop = await Game_loop.findOneAndUpdate({ _id: activeGame }, { multiplier_crash: randomInt }, { new: true })
    res.json(randomInt)
})

app.get('/retrieve', async(req, res) => {
    const game_loop = await Game_loop.findOne({ _id: activeGame })
    crashMultipler = game_loop.multiplier_crash
    res.json(crashMultipler)
    const delta = sw.read(2);
    let seconds = delta / 1000.0;
    seconds = seconds.toFixed(2);
    return
})

app.post('/send_bet', auth(), async(req, res) => {
        try {
            let bDuplicate;
            let thisUser;
            const { _id: userId } = req.body;
            const userData = await User.findOne({ _id: userId });
            if (!userData) {
                return res.status(403).send({ message: 'User not found!' });
            }
            if (req.body.bet_amount > userData.wallet) {
                return res.status(403).send({ message: 'You dont have enough balance to bet!' });
            }

            bDuplicate = false

            theLoop = await Game_loop.findOne({ _id: activeGame });

            let now = Date.now()

            if (theLoop.userIds.find(el => el.toString() === req.body._id.toString())) {
                res.status(400).send({ customError: "You are already betting this round" });
                bDuplicate = true
                return;
            }

            // thisUser = await User.findById(req.user.id)
            // if (req.body.bet_amount > thisUser.balance) {

            //   res.status(400).json({ customError: "Bet too big" });
            //   return
            // }
            // await User.findByIdAndUpdate(req.body._id, { bet_amount: req.body.bet_amount, payout_multiplier: req.body.payout_multiplier })
            // await User.updateOne({ _id: userId }, { $inc: { wallet: -req.body.bet_amount } }).exec();
            const updatedUserData = await User.findOne({ _id: userId });
            //io.emit('updateRoom', updatedUserData);
            wss.clients.forEach(round => {
                round.send(JSON.stringify({ type: "updateRoom", data: JSON.stringify(updatedUserData) }))
            })

            await Game_loop.findByIdAndUpdate(theLoop._id, { $push: { userIds: req.body._id } })

            let info_json = {
                the_user_id: req.body._id,
                the_username: req.body.username,
                bet_amount: req.body.bet_amount,
                cashout_multiplier: null,
                profit: null,
                b_bet_live: true,
            }

            live_bettors_table.push(info_json)
                //io.emit("receive_live_betting_table", JSON.stringify(live_bettors_table))
            wss.clients.forEach(round => {
                round.send(JSON.stringify({ type: "receive_live_betting_table", data: JSON.stringify(live_bettors_table) }))
            })

            res.json(`Bet placed for ${req.body.username}`)

        } catch (error) {

            console.log("gandi", error)
        }
    })

app.get('/calculate_winnings', auth(), async(req, res) => {

    let theLoop = await Game_loop.findOne({ _id: activeGame }).populate("userIds")
    playerIdList = theLoop.userIds
    crash_number = theLoop.multiplier_crash
    for await (const player of userIds) {
        if (player.payout_multiplier <= crash_number) {
            player.wallet += player.bet_amount * player.payout_multiplier
            await User.updateOne({ _id: player.id }, {...player });
        }
    }
    await theLoop.save()
    res.json("You clicked on the calcualte winnings button ")
})

app.get('/get_game_status', async(req, res) => {
    const lastGames = await Game_loop.find().populate("User").sort({ _id: -1 }).limit(11);
    lastGames.shift()
    let previous_crashes = lastGames.map(g => g.multiplierCrash);
    //io.emit('crash_history', previous_crashes)
    wss.clients.forEach(crash => {
            crash.send(JSON.stringify({ type: "crash_history", data: JSON.stringify(previous_crashes) }))
        })
        //io.emit('get_round_id_list', lastGames)
    wss.clients.forEach(round => {
        round.send(JSON.stringify({ type: "get_round_id_list", data: JSON.stringify(lastGames) }))
    })
    if (betting_phase == true) {
        res.json({ phase: 'betting_phase', info: phase_start_time })
        return
    } else if (game_phase == true) {
        res.json({ phase: 'game_phase', info: phase_start_time })
        return
    }
})

app.get('/manual_cashout_early', auth(), async(req, res) => {
    if (!game_phase) {
        return
    }
    theLoop = await Game_loop.findOne({ _id: activeGame });
    let time_elapsed = (Date.now() - phase_start_time) / 1000.0
    current_multiplier = (1.0024 * Math.pow(1.0718, time_elapsed)).toFixed(2)
    if ((current_multiplier <= game_crash_value) && theLoop.userIds.includes(req.user.id)) {
        const currUser = await User.findById(req.user.id)
        currUser.wallet += currUser.bet_amount * current_multiplier
        await currUser.save()
        await Game_loop.updateOne({ _id: theLoop._id }, { $pull: { "userIds": req.user.id } })
        for (const bettorObject of live_bettors_table) {
            if (bettorObject.the_user_id === req.user.id) {
                bettorObject.cashout_multiplier = current_multiplier
                bettorObject.profit = (currUser.bet_amount * current_multiplier) - currUser.bet_amount
                bettorObject.b_bet_live = false
                    //io.emit("receive_live_betting_table", JSON.stringify(live_bettors_table || []))
                wss.clients.forEach(liveTable => {
                    liveTable.send(JSON.stringify({ type: "receive_live_betting_table", data: JSON.stringify(live_bettors_table) }))
                })
                break
            }
        }
        res.json(currUser)
    } else {

    }
})

app.get('/auto_cashout_early', auth(), async(req, res) => {
    // console.log('called-------')
    if (!game_phase) {
        return
    }
    theLoop = await Game_loop.findOne({ _id: activeGame }).populate("User");
    let time_elapsed = (Date.now() - phase_start_time) / 1000.0
    current_multiplier = (1.0024 * Math.pow(1.0718, time_elapsed)).toFixed(2)
    if ((req.user.payout_multiplier <= game_crash_value) && theLoop.userIds.includes(req.user.id)) {
        let currUser = await User.findById(req.user.id)
            //console.log('currUserwallet Ol----',currUser.wallet)
            // currUser.wallet += currUser.bet_amount * currUser.payout_multiplier
            // await currUser.save()
        await Game_loop.updateOne({ _id: theLoop._id }, { $pull: { "active_player_id_list": req.user.id } })
        currUser = await User.findOneAndUpdate({ _id: req.user.id }, { $inc: { wallet: currUser.bet_amount * currUser.payout_multiplier } }, { new: true }).exec();
        //console.log('currUserwallet new----',currUser)
        //io.emit('updateRoom', currUser);
        wss.clients.forEach(Room => {
            Room.send(JSON.stringify({ type: "updateRoom", data: JSON.stringify(currUser) }))
        })
        for (const bettorObject of live_bettors_table) {
            if (bettorObject.the_user_id === req.user.id) {
                bettorObject.cashout_multiplier = currUser.payout_multiplier
                bettorObject.profit = (currUser.bet_amount * current_multiplier) - currUser.bet_amount
                bettorObject.b_bet_live = false
                    //io.emit("receive_live_betting_table", JSON.stringify(live_bettors_table || []))
                wss.clients.forEach(liveTable => {
                    liveTable.send(JSON.stringify({ type: "receive_live_betting_table", data: JSON.stringify(live_bettors_table) }))
                })
                break
            }
        }
        res.json(currUser)
    }
})

app.post('/send_message_to_chatbox', auth(), async(req, res) => {
    const user_message = req.body.message_to_textbox
    const message_json = {
            userId: req.user.id,
            content: user_message,
            time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
            date: new Date().toLocaleDateString(),
        }
        // await ChatModel.create(message_json);

    messages_list.push(message_json)
        //io.emit("receive_message_for_chat_box", JSON.stringify(messages_list || []))
    wss.clients.forEach(chatBox => {
        chatBox.send(JSON.stringify({ type: "receive_message_for_chat_box", data: JSON.stringify(messages_list) }))
    })
    res.send("Message sent")
})

// app.get('/get_chat_history', async (req, res) => {
//   const chats = await ChatModel.find().populate("userId");
//   res.json(chats)
//   return
// })

app.get('/retrieve_active_bettors_list', auth(), async(req, res) => {
    //io.emit("receive_live_betting_table", JSON.stringify(live_bettors_table || []))
    wss.clients.forEach(chatBox => {
        chatBox.send(JSON.stringify({ type: "receive_live_betting_table", data: JSON.stringify(live_bettors_table) }))
    })
    res.send(JSON.stringify(live_bettors_table || []))
    return
})

app.get('/retrieve_bet_history', auth(), async(req, res) => {
    let theLoop = await Game_loop.find().sort({ _id: -1 }).limit(11);
    theLoop.shift();
    const previous_crashes = theLoop.map(e => e.multiplierCrash)
        //io.emit('crash_history', previous_crashes);
    wss.clients.forEach(crash => {
        crash.send(JSON.stringify({ type: "crash_history", data: JSON.stringify(previous_crashes) }))
    })
    res.send(previous_crashes)
    return
})
app.post('/updateTransaction', auth(), async(req, res) => {
    const { clientSeed, serverSeed, nonce, result } = req.body;
    const { _id: userId } = req.user;
    const userData = await User.findOne({ _id: userId });
    if (!userData) {
        return res.status(403).send({ message: 'User not found!' });
    }
    const message_json = {
        userId: req.user.id,
        serverSeed: serverSeed,
        clientSeed: clientSeed,
        nonce: nonce,
        result: result,
    }
    const transaction = await transactions.create(message_json);
    const transactionId = transaction._id
    if (transactionId)
        return res.send({ message: true, message: 'Successfully added', transactionId });
    else
        return res.send({ message: false, message: 'Something went wrong' });
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    return res.send("No User Authentication")
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

app.listen(process.env.SERVER_PORT, () => {
    console.log("Server started at", process.env.SERVER_PORT)
    setInterval(async() => {
        await loopUpdate()
    }, 2000)
});

const cashout = async() => {
    try {
        theLoop = await Game_loop.findOne({ isActive: true }).populate("userIds")
        const playerIdList = theLoop ?.userIds
        crash_number = game_crash_value
        for await (const currUser of playerIdList) {
            if (currUser.payout_multiplier <= crash_number) {
                currUser.wallet += currUser.bet_amount * currUser.payout_multiplier
                //console.log("current user", currUser)
                await User.updateOne({ _id: currUser._id }, currUser)
            }
        }
    } catch (error) {
        console.log(error)
    }
}

// Run Game Loop
let phase_start_time = Date.now()


const messages_list = []
let live_bettors_table = []
let betting_phase = false
let game_phase = false
let cashout_phase = true
let game_crash_value = -69
let sent_cashout = true

// Game Loop
const loopUpdate = async() => {
    let time_elapsed = (Date.now() - phase_start_time) / 1000.0
    if (betting_phase) {
        if (time_elapsed > 6) {
            sent_cashout = false
            betting_phase = false
            game_phase = true
                //io.emit('start_multiplier_count')
            wss.clients.forEach(multiplier => {
                multiplier.send(JSON.stringify({ type: "start_multiplier_count", data: "" }));
            });
            phase_start_time = Date.now()
        }
    } else if (game_phase) {
        current_multiplier = (1.0024 * Math.pow(1.0718, time_elapsed)).toFixed(2)
        if (current_multiplier > game_crash_value) {
            const availableChars =
                "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            let randomString = "";
            for (let i = 0; i < 20; i++) {
                randomString +=
                    availableChars[Math.floor(Math.random() * availableChars.length)];
            }
            //io.emit('stop_multiplier_count', { value: game_crash_value.toFixed(2), serverSeed: randomString })
            wss.clients.forEach(stop => {
                stop.send(JSON.stringify({ type: "stop_multiplier_count", data: game_crash_value.toFixed(2) }))
            })
            game_phase = false
            cashout_phase = true
            phase_start_time = Date.now()
        }
    } else if (cashout_phase) {
        if (!sent_cashout) {
            cashout()
            sent_cashout = true
            right_now = Date.now()
            await Game_loop.updateOne({ _id: activeGame }, {
                multiplierCrash: game_crash_value,
                isActive: false
            })
        }

        if (time_elapsed > 3) {
            const gameCount = await Game_loop.countDocuments();
            const game = await Game_loop.create({ roundNumber: gameCount + 1 })
            activeGame = game._id
            cashout_phase = false
            betting_phase = true
            let randomInt = Math.floor(Math.random() * (9999999999 - 0 + 1) + 0)
            if (randomInt % 33 == 0) {
                game_crash_value = 1
            } else {
                random_int_0_to_1 = Math.random()
                while (random_int_0_to_1 == 0) {
                    random_int_0_to_1 = Math.random
                }
                game_crash_value = 0.01 + (0.99 / random_int_0_to_1)
                game_crash_value = Math.round(game_crash_value * 100) / 100
                    // game_crash_value= 1000
            }
            //io.emit('update_user')
            wss.clients.forEach(userU => {
                userU.send(JSON.stringify({type: "update_user", data: ""}))
            })
            const lastGames = await Game_loop.find({}).sort({ _id: -1 }).limit(11);
            lastGames.shift();
            const previous_crashes = lastGames.map(e => e.multiplierCrash);
            // io.emit('crash_history', previous_crashes || [])
            // io.emit('get_round_id_list', lastGames || [])
            // io.emit('start_betting_phase')
            // io.emit('testingvariable')
            wss.clients.forEach(crash => {
                crash.send(JSON.stringify({type: "crash_history", data: JSON.stringify(previous_crashes)}))
            })
            wss.clients.forEach(round => {
                round.send(JSON.stringify({type: "get_round_id_list", data: JSON.stringify(lastGames)}))
            })
            wss.clients.forEach(start => {
                start.send(JSON.stringify({type: "start_betting_phase", data: ""}))
            })
            // wss.clients.forEach(test => {
            //     test.send(JSON.stringify({type: "testingvariable", data: ""}))
            // })
            live_bettors_table = []
            phase_start_time = Date.now()
        }
    }
}