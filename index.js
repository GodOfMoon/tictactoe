//Прикреляем библиотеки
var server = require('./server');
var router = require('./router');
var requestHandlers = require('./requestHandlers');

//Объявляем набор функций сервера
var handle = {}
handle['/download'] = requestHandlers.download; //скачать файл с сервера

//Запускаем сервер
server.start(router.route, handle);