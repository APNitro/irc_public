const formatMessage = require('./utils/messages');
var cors = require("cors");
var path = require('path');
var asyncLib = require("async");
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const {
    emitMessage,
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
    userLeaveRoom,
    getMessagesRoom
} = require('./utils/users');
var apiRouter = require("./apiRouter").router;
var cors = require("cors");
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    pingTimeout: 180000, pingInterval: 25000,
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
const botName = 'ChatCord Bot';
io.on('connection', socket => {
    socket.on('joinPrivate', ({pseudo}) => {
        socket.join(pseudo);
    })
    socket.on('joinRoom', async ({ username, room }) => {
        const user = await userJoin(socket.id, username, room);

        socket.join(room);

        // Welcome current user
        //socket.emit('message', { room: room, message: formatMessage(room, 'Welcome to ChatCord!') });
        try {
            var messages = await getMessagesRoom(room);
        } catch (err) {

        }
        if (messages) {
            asyncLib.forEachOf(messages, (message, key, callback) => {
                console.log(message.content + ' ' + room)
                try {
                 socket.emit('message', { room: room, message: { username: message.User.pseudo, message: message.content, time: message.time } })
                } catch(err) {

                }
                callback()
            }, err => {

            })
        }
        // Broadcast when a user connects
        io.to(room)
            .emit(
                'message',
                { room: room, message: formatMessage(botName, `${user.username} has joined the chat`) }
            );

        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });
    socket.on('roomInfo', async (room) => {
        socket.emit('info', {
            room: room,
            users: await getRoomUsers(room)
        })
    })

    // Listen for chatMessage
    socket.on('chatMessage', ({ message, room, username }) => {
        const user = getCurrentUser(socket.id);
        emitMessage({ room, username, message })
        io.to(room).emit('message', { room: room, message: formatMessage(username, message) })
        //io.to(user.room).emit('message', formatMessage(user.username, message));
    });
    socket.on('leaveRoom', async ({ username, room }) => {
        //const user = getCurrentUser(socket.id);
        socket.leave(room);
        var user = await userLeaveRoom(username, room);
        if (user) {
            socket.emit('userState', user);
        }
        io.to(room).emit('message', { room: room, message: formatMessage(botName, `${username} has left the chat`) })
    })
    socket.on('privateMessage', ({ message, userTo, username}) => {
        io.to(userTo).emit('privateMsg', {message: message, username: username})
    })

    // Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit(
                'message',
                { room: user.room, message: formatMessage(botName, `${user.username} has left the chat`) }
            );

            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
});
app.use(require('express').static(path.join(__dirname, '/'), { index: '_' }));
app.use(
    cors(),
    bodyParser.urlencoded({ extended: true }),
    bodyParser.json()
);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/api/", apiRouter);
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname);
//app.use("/", apiRouter);
http.listen(8080, () => {
    console.log('listening on *:8080');
});