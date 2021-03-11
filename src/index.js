const http = require('http')
const express = require("express");
const path = require("path");
const socketio = require('socket.io')//we get a function back
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app=express()
const server = http.createServer(app)
//we call that function to actually configure
//socket I O to work with a given server and we pass to it that server.
//this is why we had to do the refactoring socket.
//IO expects it to be called with the raw HTTP server.
const io = socketio(server)//io common name used.

app.use(express.static(path.join(__dirname,"..","public")))
const port = process.env.PORT || 3000;

//giving event parameter and a function to perform when this event fires
io.on('connection',(socket)=>{    //listening for a given event to occur.
                                    //socket is an object and it contains information about the new connection.
    console.log('New WebSocket connection'); 

    socket.on('join', (options, callback) => {
        const { error, user} = addUser({ id: socket.id, ...options})

        if (error) {
            return callback(error) //letting the client know what went wrong
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin','Welcome!'))// emit an event to that particular connection
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined!`))//send a message to all sockets except the one sendinf the message
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        }) //send a message to all users in the room
        callback()

        // socket.emit -send only to this socket, io.emit - send to everybody, socket.broadcast.emit - send to everybody except this socket
        //io.to.emit, socket.broadcast.to.emit - same as above, only in room
    })

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }

        const { room, username } = getUser(socket.id)

        io.to(room).emit('message',generateMessage(username, message))// emit an event to everyone
        callback()
    })

    socket.on('sendLocation',(position, callback) => {
        const { room,username } = getUser(socket.id)
        io.to(room).emit('locationMessage',generateLocationMessage(username, `https://google.com/maps?q=${position.latitude},${position.longitude}`))
        callback()
    })

    socket.on('disconnect',() => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left`))//we dont use 'broadcast' since the user that send the message has already disconnet and won't recieve the message
            io.to(user.room).emit('roomData',{ //update the room list
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    }) //disconnect is a built in event from the io library
})



server.listen(port, () => {
    console.log(`Started up at port ${port}`);
  });