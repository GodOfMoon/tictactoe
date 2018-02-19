//libs
var fs = require('fs');
var path = require('path');

//function for download files from server
function download(response, post, pathname) {
	console.log('Request handler "download" was called. Downloading ' + pathname);
	
	//request for index.html
	if (pathname === '' || pathname === '/' || pathname === undefined)
		pathname = '/html/index.html';
	var filePath = '.' + pathname;

	//check file extension & declare content type
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
	//if file not exist
	if (!fs.existsSync(filePath) || (contentType === '')){
		console.log('Error. Cannot download file ' + pathname);
		fs.readFile('./html/index.html', function(error, content) {
			response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
			response.end(content, 'utf-8');
		});
	} else {
		fs.readFile(filePath, function(error, content) {
			//download file
			response.writeHead(200, { 'Content-Type': contentType});
			response.end(content, 'utf-8');
		});
	}
}
//export function
exports.download = download;