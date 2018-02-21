//libs
'use strict';
var http = require('http');
var url = require('url');
var qs = require('querystring');
var io = require('socket.io');

class Game {
	constructor(turn, x, o, first, second, nick1, nick2) {
		this.turnValue = turn;
		this.x = '';
		this.o = '';
		this.second = '';
	}
	set x(value){
    	this.xValue = value;
	}
	set o(value){
    	this.oValue = value;
	}
	set first(value){
    	this.firstValue = value;
	}
	set second(value){
    	this.secondValue = value;
	}
	set turn(value){
    	this.turnValue = value;
	}
	set nick1(value){
    	this.nick1Value = value;
	}
	set nick2(value){
    	this.nick2Value = value;
	}
	set mas(value){
    	this.masValue = new Array(value);
	}
	get x(){
		return `${this.xValue}`;
	}
	get o(){
		return `${this.oValue}`;
	}
	get first(){
		return `${this.firstValue}`;
	}
	get second(){
		return `${this.secondValue}`;
	}
	get turn(){
		return this.turnValue;
	}
	get nick1(){
		return `${this.nick1Value}`;
	}
	get nick2(){
		return `${this.nick2Value}`;
	}
	get mas(){
		return this.masValue;
	}
	cleanMas() {
		delete this.masValue;
	}
};
function time(){
	var currentTime = new Date();
	var hh = currentTime.getHours();
	var mm = currentTime.getMinutes()
	return [
		hh,
		':',
		(mm>9 ? '' : '0') + mm
	].join('');
}
//describe function of starting server
function start(route, handle) {
	var port = 8080;
	var app = http.createServer(onRequest);
	io = io(app);
	app.listen(port);
	console.log('Server has started.');

	
	//request response function
	function onRequest(request, response) {
		
		//parse url
		var pathname = url.parse(request.url).pathname;
		
		//add inf to console
		console.log('');
		console.log('Request for ' + pathname + ' received.');
		
		//add opportunity to work with post-data
		var postData = '';
		request.setEncoding('utf8');
		request.addListener('data', function(postDataChunk) {
			postData += postDataChunk;
		});
		request.addListener('end', function() {
			
			//parse post-data
			var post = qs.parse(postData);
			
			//send request to the router
			route(handle, pathname, response, post);
		});
	}
	
	//logic of a game and chat 
	var games = [];
	var users = [];
	//if user connect
	io.on('connection', function(socket){
		console.log('IO: an user connected');
		console.log('IO: id:', socket.id);
		
		//if user disconnect
		socket.on('disconnect', function(){
			console.log('IO: user disconnected');
			//if user unlock javascript
			//if user played a game -- must clear memory
			if (users[socket.io] != undefined) {
				var room = users[socket.io];
				delete users[socket.io];
				io.sockets.in(room).emit('chat message', '[' + time() + '] System: your friend just leave :(');
				if (socket.io === games[room].first && games[room].second === '') {
					delete games[room];
					console.log('IO: room was deleted');
				} else {
					if (socket.io === games[room].first) {
						games[room].first = games[room].second;
						games[room].second = '';
					}
					io.sockets.in(room).emit('chat message', '[' + time() + '] System: follow link, to play a game http://localhost:8080/' + room);
				}
			}
		});
		//if user send msg
		socket.on('chat message', function(msg, room){
			console.log('IO: in:', room, 'chat message:', msg);
			//write msg to room
			var nick;
			try {
				if (socket.id === games[room].first) nick = games[room].nick1;
				if (socket.id === games[room].second) nick = games[room].nick2;
			} catch(e){}
			io.sockets.in(room).emit('chat message', '[' + time() + '] ' + nick + ': '+ msg);
		});
		//if 2nd user went to room
		socket.on('enter the room', function(room){
			if (games[room] === undefined) {
				//if user follow to incorrect link
				socket.join(room);
				io.sockets.in(room).emit('chat message', '[' + time() + '] System: you created new room! Follow link, to play a game http://localhost:8080/' + room);
				games[room] = new Game(0);
				games[room].first = socket.id;
				users[socket.id] = room;
			} else {
				if (games[room].second != '') {
					// if third user wanted join into room
					var room = Math.random().toString(36).substring(2);
					socket.join(room);
					io.sockets.in(room).emit('chat message', '[' + time() + '] System: that room is closed. If you want play a game go to http://localhost:8080/');
					games[room] = new Game(0);
					games[room].first = socket.id;
					users[socket.id] = room;
				} else {
					io.sockets.in(room).emit('chat message', '[' + time() + '] System: somebody has just entered!');
					socket.join(room);
					games[room].second = socket.id;
					users[socket.id] = room;
				}
			}
		});
		socket.on('nick', function(room, nick){
			if (games[room].first === socket.id) {
				games[room].nick1 = nick;
			}
			if (games[room].second === socket.id) {
				games[room].nick2 = nick;
			}
		});
		socket.on('ready', function(room){
			var msg;
			if (games[room].first === socket.id) {
				msg = games[room].nick1 + ' is ready!';
			}
			if (games[room].second === socket.id) {
				msg = games[room].nick2 + ' is ready!';
			}
			if (games[room].x === '') {
				games[room].x = socket.id;
				msg += ' Playing for X.';
			} else {
				games[room].o = socket.id;
				msg += ' Playing for O.';
				//prepare for a game
				games[room].cleanMas();
				games[room].mas = 9;			
				games[room].turn = 0;
				io.sockets.in(room).emit('start');
			}
			
			io.sockets.in(room).emit('chat message', '[' + time() + '] System: ' + msg);
		});
		socket.on('get opponent', function(){
			//create unique name for a room
			var room = Math.random().toString(36).substring(2);
			//join into room
			socket.join(room);
			io.sockets.in(room).emit('chat message', '[' + time() + '] System: follow link, to play a game http://localhost:8080/' + room);
			//send to user value of his room
			io.sockets.in(room).emit('set room', room);
			console.log('IO: room was set:', room);
			games[room] = new Game(0);
			games[room].first = socket.id;
			users[socket.id] = room;
		});
		//if user click on the square
		socket.on('hod', function(room, i){
			//if have no enemy
			if (games[room].second === ''){
				io.sockets.in(room).emit('chat message', '[' + time() + '] System: follow link!');
			}
			if (games[room].x === '' && games[room].second != ''){
				io.sockets.in(room).emit('chat message', '[' + time() + '] System: Noone is not ready!');
			}
			if (games[room].o === '' && games[room].second != ''){
				io.sockets.in(room).emit('chat message', '[' + time() + '] System: Zeros (0) is not ready!');
			} else {
				//if turn of cross, value sended by cross, square is empty
				if (games[room].turn % 2 === 0 && games[room].x === socket.id && games[room].mas[i] === undefined) {
					games[room].turn++;
					games[room].mas[i] = 'x';
					io.sockets.in(room).emit('turn', i, 'x');
					//check winner
					reactionOnTheWinner(room);
				}
				//if turn of zero, value sended by zero, square is empty
				if (games[room].turn % 2 === 1 && games[room].o === socket.id && games[room].mas[i] === undefined) {
					games[room].turn++;
					games[room].mas[i] = 'o';
					io.sockets.in(room).emit('turn', i, 'o');
					//check winner
					reactionOnTheWinner(room);
				}
			}
		});
		//reaction on the winner
		function reactionOnTheWinner(room){
			var check = checkWinner(games[room].mas, +games[room].turn);
			if (check){
				if (check === 'x') io.sockets.in(room).emit('chat message', '[' + time() + '] Победили крестики');
				if (check === 'o') io.sockets.in(room).emit('chat message', '[' + time() + '] Победили нолики');
				if (check === 1) io.sockets.in(room).emit('chat message', '[' + time() + '] Победила дружба');
				io.sockets.in(room).emit('end');
				games[room].x = '';
				games[room].o = '';
			}
		}		
	});
	//have we 3 X or O in line or not
	function checkWinner(mas, hod){
		if (mas[0] === mas[1] && mas[0] === mas[2]) return mas[0];
		if (mas[3] === mas[4] && mas[3] === mas[5]) return mas[3];
		if (mas[6] === mas[7] && mas[6] === mas[8]) return mas[6];
		
		if (mas[0] === mas[3] && mas[0] === mas[6]) return mas[0];
		if (mas[1] === mas[4] && mas[1] === mas[7]) return mas[1];
		if (mas[2] === mas[5] && mas[2] === mas[8]) return mas[2];
		
		if (mas[0] === mas[4] && mas[0] === mas[8]) return mas[0];
		if (mas[2] === mas[4] && mas[2] === mas[6]) return mas[2];
		if (hod === 9) return 1;
		return 0;
	}
}
//export functions
exports.start = start;