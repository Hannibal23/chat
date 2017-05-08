var express = require('express'),
app = express(),
path = require("path"),
server =  require('http').createServer(app),
io = require('socket.io')(server),
port = process.env.PORT || 3000,
clients = {};

server.listen(port, function() {
    console.log('listening on :', port);
});

app.use(express.static(path.join(__dirname, '\public')));

io.on('connection', function(socket){
    var user = false;

    socket.on('add user', function(username) {

        if(user) {
            return;
        }

        socket.username = username;
        clients[username] = socket.id;
        user = true;
        socket.emit('login');
        socket.broadcast.emit('user joined', {
            username: socket.username,
        });
    });

    socket.on('private', function(data) {
        socket.broadcast.to(clients[data.recepient]).emit('msg', {
            username: socket.username,
            message: data.message
        });
    });

    socket.on('broadcast', function (data) {
        socket.broadcast.emit('broadcast', {
            username: socket.username,
            message: data
        });
    });

    socket.on('disconnect', function () {

        if (user) {
            socket.broadcast.emit('user left', {
                username: socket.username,
            });
        }

    });

});
