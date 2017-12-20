//Прикреляем библиотеки
var http = require('http');
var url = require('url');
var qs = require('querystring');
var io = require('socket.io');

//Описываем функцию запуска сервера
function start(route, handle) {
	var port = 8080;
	var app = http.createServer(onRequest);
	io = io(app);
	app.listen(port);
	console.log('Server has started.');

	//ловим запрос
	function onRequest(request, response) {
		var postData = '';
		//выясняем, что хотят от сервера
		var pathname = url.parse(request.url).pathname;
		
		console.log('');
		console.log('Request for ' + pathname + ' received.');

		//ловим пост-данные
		request.setEncoding('utf8');
		request.addListener('data', function(postDataChunk) {
			postData += postDataChunk;
		});
		request.addListener('end', function() {
			//парсим пост-данные для дальнейшей работы
			var post = qs.parse( postData );
			//отправляем запрос в роутер
			route(handle, pathname, response, post);
		});
	}
	//логика игры
	var games = [];
	//Если пользователь присоединился
	io.on('connection', function(socket){
		console.log('IO: a user connected');
		console.log('IO: id:', socket.id);
		
		//Если пользователь отсоединился
		socket.on('disconnect', function(){
			console.log('IO: user disconnected');
		});
		//Если пользователь написал сообщение
		socket.on('chat message', function(msg, room){
			console.log('IO: in:', room, 'chat message:', msg);
			//Пишем сообщение в комнату пользователя
			io.sockets.in(room).emit('chat message', msg);
		});
		//Если 2й пользователь зашел в комнату
		socket.on('enter the room', function(room){
			//Сообщаем комнате, что кто то зашел
			io.sockets.in(room).emit('chat message', 'System: somebody has just entered');
			//Пускаем его в комнату
			socket.join(room);
			//Инициализируем партию
			games[room] = new Object();
			//Количество ходов
			games[room].hod = 0;
			//Зашедший пользователь играет за нолики
			games[room].o = socket.id;
		});
		socket.on('get opponent', function(){
			//Создаем уникальное имя комнаты
			var room = Math.random().toString(36).substring(2);
			//Запускаем пользователя из корня сервера в комнату
			socket.join(room);
			//Сообщаем пользователю, как начать партию
			io.sockets.in(room).emit('chat message', 'System: follow link, to play a game http://localhost:8080/' + room);
			//Сообщаем клиенту его комнату
			io.sockets.in(room).emit('set room', room);
			console.log('IO: room was set:', room);
		});
		//Если пользователь кликнул по игровому полю
		socket.on('hod', function(room, i){
			//Если противника нет
			if (games[room].o === undefined){
				io.sockets.in(room).emit('chat message', 'System: follow link!');
			} else {
				//Если ходил крестик в первый раз 
				if (games[room].hod === 0 && games[room].o != socket.id){
					games[room].x = socket.id;
					games[room].mas = [];
				}
				//Если ходил крестик, ход крестика, поле не занято
				if (games[room].hod % 2 === 0 && games[room].x === socket.id && games[room].mas[i] === undefined) {
					games[room].hod++;
					games[room].mas[i] = 'x';
					io.sockets.in(room).emit('hod', i, 'x');
					//Проверка, если ли счастливчик
					reactionOnTheWinner(room);
				}
				//Если ходил нолик, ход нолика, поле не занято
				if (games[room].hod % 2 === 1 && games[room].o === socket.id && games[room].mas[i] === undefined) {
					games[room].hod++;
					games[room].mas[i] = 'o';
					io.sockets.in(room).emit('hod', i, 'o');
					//Проверка, если ли счастливчик
					reactionOnTheWinner(room);
				}
			}
		});
		//Реакция на победителя
		function reactionOnTheWinner(room){
			var check = checkWinner(games[room].mas, games[room].hod);
			if (check){
				if (check === 'x') io.sockets.in(room).emit('chat message', 'Победили крестики');
				if (check === 'o') io.sockets.in(room).emit('chat message', 'Победили нолики');
				if (check === 1) io.sockets.in(room).emit('chat message', 'Победила дружба');
				io.sockets.in(room).emit('end');
			}
		}		
	});
	//Функция проверки, есть ли победитель
	function checkWinner(mas, hod){
		//0-1-2
		//3-4-5
		//6-7-8
		if (mas[0] === mas[1] && mas[0] === mas[2]) return mas[0];
		if (mas[3] === mas[4] && mas[3] === mas[5]) return mas[3];
		if (mas[6] === mas[7] && mas[6] === mas[8]) return mas[6];
		
		if (mas[0] === mas[3] && mas[0] === mas[6]) return mas[0];
		if (mas[1] === mas[4] && mas[1] === mas[7]) return mas[1];
		if (mas[2] === mas[5] && mas[2] === mas[8]) return mas[2];
		
		if (mas[0] === mas[4] && mas[0] === mas[8]) return mas[0];
		if (mas[2] === mas[4] && mas[2] === mas[6]) return mas[2];
		if (hod === 8) return 1;
		return 0;
	}
}
//Создаем возможность использовать функцию из других файлов
exports.start = start;