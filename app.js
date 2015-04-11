var express = require('express');
var path 	= require('path');
var app 	= express();
var server 	= require('http').Server(app);
var io 		= require('socket.io')(server);


app.use("/public", express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
	socket.emit('news', { hello: 'world' });
	socket.on('my other event', function (data) {
		console.log(data);
	});
});

server.listen(3000);