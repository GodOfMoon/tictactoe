//libs
var fs = require('fs');
var path = require('path');

//function for download files from server
function download(response, post, pathname) {
	console.log('Request handler "download" was called. Downloading ' + pathname);
	var filePath = pathname;
	
	//request for index.html
	if (pathname === '' || pathname === '/' || pathname === undefined)
		filePath = '/index.html';

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
		filePath = './html/index.html';
	}
	//download file
	fs.readFile(filePath, function(error, content) {
		response.writeHead(200, { 'Content-Type': contentType});
		response.end(content, 'utf-8');
	});
}
//export function
exports.download = download;