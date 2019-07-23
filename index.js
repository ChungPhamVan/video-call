var express = require('express');

var app = express();
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));

var listFriend = [];
var port = 3000;
var server = require('http').Server(app);
socketIo = require('socket.io')(server);
socketIo.on('connection', function(socket) {
    console.log('Co nguoi ket noi...');
    socket.on('client-signup', function(data) {
        const existUser = listFriend.find(user => user.nameSignup == data.nameSignup);
        if(existUser) {
            socket.emit('existed-user');
        } else {
            socket.user = data;
            listFriend.push(data);
            socket.broadcast.emit('server-send-listFriend', listFriend);
            socket.emit('client-signup-1user', listFriend);
        }
        
    });
    socket.on('client-logout', function() {
        const indexUser = listFriend.indexOf(socket.user);
        listFriend.splice(indexUser, 1);
        socket.broadcast.emit('server-send-listFriend', listFriend);
        socket.emit('1-user-logout');
    });
});
app.get('/', function(req, res, next) {
    res.render('index.ejs');
});


server.listen(process.env.PORT || port, function() {
    console.log('Server listening..., port: ' + port);
});