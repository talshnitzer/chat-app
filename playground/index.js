const http = require('http')
const express = require("express");
const path = require("path");
const socketio = require('socket.io')//we get a function back

const app=express()
const server = http.createServer(app)
//we call that function to actually configure
//socket I O to work with a given server and we pass to it that server.
//this is why we had to do the refactoring socket.
//IO expects it to be called with the raw HTTP server.
const io = socketio(server)//io common name used.

app.use(express.static(path.join(__dirname,"..","public")))
const port = process.env.PORT || 3000;

let count = 0;

//server (emit) -> client (receive) - countUpdated
//client (emit) -> server (receive) - increment

//giving event parameter and a function to perform when this event fires
io.on('connection',(socket)=>{    //listening for a given event to occur.
                                    //socket is an object and it contains information about the new connection.
    console.log('New WebSocket connection'); 

    socket.emit('countUpdated', count)

    socket.on('increment', () => {
        count++
        //socket.emit('countUpdated',count)//emits an event to that specific connection.
        io.emit('countUpdated', count)     //emits the event to every single connection
    })
})

server.listen(port, () => {
    console.log(`Started up at port ${port}`);
  });