//Прикреляем библиотеки
var fs = require('fs');
var path = require('path');

//Функция скачивания файлов с сервера
function download(response, post, pathname) {
	console.log('Request handler "download" was called. Downloading ' + pathname);
	
	//если запрос шел в корень, то запрашиваем index.html
	if (pathname === '' || pathname === '/' || pathname === undefined)
		pathname = '/index.html';
	//скачиваем файл из корня сервера
	var filePath = pathname;
	
	//выясняем, с каким расширением файл хотят скачивать
	var extname = path.extname(pathname);
	var contentType = '';
	switch (extname) {
		case '.html':
			filePath = './html' + filePath;
			contentType = 'text/html; charset=utf-8';
			break;
		case '.css':
			filePath = './css' + filePath;
			contentType = 'text/css';
			break;
	}
	//если файл не доступен на чтение
	if (!fs.existsSync(filePath) || (contentType === '')){
		console.log('Error. Cannot download file ' + pathname);
		fs.readFile('./html/index.html', function(error, content) {
			response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
			response.end(content, 'utf-8');
		});
	} else {
		fs.readFile(filePath, function(error, content) {
			//выгружаем файлик
			response.writeHead(200, { 'Content-Type': contentType});
			response.end(content, 'utf-8');
		});
	}
}
//Создаем возможность использовать функции из других файлов
exports.download = download;