const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

let users = [];

app.use(express.static(__dirname + '/public'));
app.get('/', (req,res)=>{
    res.sendFile(__dirname + '/index.html');
});


io.on('connection', (socket)=>{

    socket.on('login', (data)=>{
        const found = users.find((nickname)=>{
            return nickname === data
        })

        if(!found){
            users.push(data);
            socket.nickname = data;
            io.sockets.emit('login', {status: 'OK'});
            io.sockets.emit('users', {users})
        }else{
            io.sockets.emit('login', {status: 'FAILED'});
        }
    });

    socket.on('message', (data)=>{
        io.sockets.emit('new message', {
            message: data,
            time: new Date(),
            nickname: socket.nickname
        });
    });
    // console.log(`users: ${users.length} `)

    socket.on('disconnect', (data)=>{
        for( let index = 0; index < users.length; index++){
            if(users[index] === socket.nickname){
                users.splice(index, 1);
            }
        }

        io.sockets.emit('users', {users});
    });
});

server.listen(3000, ()=>{
    console.log('listening on port 3000');
});